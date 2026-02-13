
import { GoogleGenAI, Part, Content, Tool, Type, FunctionDeclaration } from "@google/genai";
import { ChatMessage, GroundingSource, MediaAsset, ImageGenerationConfig } from '../types';

// Helper para obter API key: prioriza .env, mas usa localStorage como fallback
export const getApiKey = (): string | null => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim() !== '') return envKey;
    return localStorage.getItem('talia_api_key');
};

// Interfaces para argumentos de chamadas de função do Gemini
interface SaveAssetArgs {
    nome: string;
    conteudo: string;
    tipo: 'documento' | 'codigo';
}

interface OpenImageStudioArgs {
    prompt_sugerido: string;
}

interface GenerateImageArgs {
    prompt_em_ingles: string;
}

export const YOUTUBE_PROXY_URL: string = '';

export const taliaPersona = `
VOCÊ É TALIA.AI, UMA CONSULTORA ESTRATÉGICA PASSIVA E DE ALTA FIDELIDADE.
SUA LÍNGUA É EXCLUSIVAMENTE O PORTUGUÊS DO BRASIL.

### DIRETRIZES DE VERACIDADE (ZERO ALUCINAÇÃO):
1. **HONESTIDADE INTELECTUAL:** JAMAIS invente ou deduza informações factuais. Se você não sabe algo ou não tem acesso a dados recentes, ADMITA a limitação. Não tente preencher lacunas com "palpites".
2. **VALIDAÇÃO:** Ao responder, baseie-se estritamente no seu conhecimento interno ou nos arquivos fornecidos no Stage.

### DIRETRIZES DE COMPORTAMENTO (ZERO PROATIVIDADE):
1. **POSTURA REATIVA:** Você NÃO deve agir, criar arquivos, ou executar funções a menos que seja EXPLÍCITAMENTE comandada.
2. **SAUDAÇÕES:** Se o usuário disser "Oi", "Olá" ou se apresentar, APENAS responda cordialmente. NÃO crie arquivos de log, não crie documentos de boas-vindas. Apenas converse.
3. **PROTOCOLO DE CONFIRMAÇÃO (RIGOROSO):**
   - Antes de usar a ferramenta \`salvar_ativo_no_stage\`, você deve OBRIGATORIAMENTE descrever o que pretende criar e pedir confirmação.
   - Exemplo: "Deseja que eu gere um documento Markdown com essa análise?" -> Somente se o usuário disser "Sim", você chama a função.
   - JAMAIS chame uma função "silenciosamente" junto com uma saudação.

### DIRETRIZES VISUAIS:
- Use \`abrir_estudio_de_imagem\` apenas se o usuário pedir uma imagem explicitamente.

### IDENTIDADE:
- Você tem visão total do Stage (arquivos injetados).
- Se houver um arquivo "Sessao_Voz_Log.md", use-o apenas para memória, nunca escreva nele via função.
`;

const salvarAtivoFD: FunctionDeclaration = {
    name: 'salvar_ativo_no_stage',
    description: 'CRÍTICO: USAR APENAS APÓS O USUÁRIO CONFIRMAR EXPLICITAMENTE NO CHAT. Salva um documento ou código no Stage.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            nome: { type: Type.STRING, description: 'Nome do arquivo SEMÂNTICO (ex: roadmap_projeto.md).' },
            conteudo: { type: Type.STRING, description: 'Conteúdo completo.' },
            tipo: { type: Type.STRING, enum: ['documento', 'codigo'], description: 'Categoria.' }
        },
        required: ['nome', 'conteudo', 'tipo']
    }
};

const abrirEstudioFD: FunctionDeclaration = {
    name: 'abrir_estudio_de_imagem',
    description: 'Abre a interface de geração de imagem. USAR APENAS SE O USUÁRIO SOLICITAR UMA IMAGEM.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            prompt_sugerido: { type: Type.STRING, description: 'Prompt em inglês.' }
        },
        required: ['prompt_sugerido']
    }
};

const gerarImagemImediataFD: FunctionDeclaration = {
    name: 'gerar_imagem_imediata',
    description: 'Gera imagem instantânea. USAR APENAS SE EXPLICITAMENTE PEDIDO.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            prompt_em_ingles: { type: Type.STRING, description: 'Prompt em inglês.' }
        },
        required: ['prompt_em_ingles']
    }
};

export const chatTools: Tool[] = [
    { functionDeclarations: [salvarAtivoFD, abrirEstudioFD, gerarImagemImediataFD] }
];

// Live tools
export const liveTools: Tool[] = [{
    functionDeclarations: [salvarAtivoFD, abrirEstudioFD]
}];

export const cleanFilename = (prompt: string, suffix: string = 'png') => {
    const stopWords = ['a', 'an', 'the', 'of', 'in', 'on', 'with', 'style', 'concept', 'art', 'image', 'picture'];
    const keywords = prompt.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => !stopWords.includes(w) && w.length > 2)
        .slice(0, 4)
        .join('_');
    
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `talia_concept_${keywords || 'visual'}_${timestamp}.${suffix}`;
};

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
    });
}

async function prepareAssetParts(assets: MediaAsset[]): Promise<Part[]> {
    const parts: Part[] = [];
    for (const asset of assets) {
        try {
            if (asset.blob) {
                const mimeType = asset.mimeType || asset.blob.type;
                if (mimeType === 'application/pdf' || mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
                    const base64 = await blobToBase64(asset.blob);
                    parts.push({ inlineData: { mimeType, data: base64 } });
                    parts.push({ text: `[ATIVO NO STAGE: "${asset.fileName}"]` });
                } 
                else if (asset.type === 'documento' || asset.type === 'codigo' || asset.type === 'text' || mimeType === 'text/plain' || mimeType === 'text/markdown') {
                    const textContent = await asset.blob.text();
                    parts.push({ text: `\n### ARQUIVO NO STAGE: "${asset.fileName}"\n\`\`\`\n${textContent}\n\`\`\`\n` });
                }
            }
        } catch (e) {
            console.warn(`Erro no ativo ${asset.fileName}:`, e);
        }
    }
    return parts;
}

export const getChatResponse = async (
    history: ChatMessage[], 
    newMessage: string, 
    files?: File[], 
    userName?: string, 
    sessionId?: string,
    stageAssets?: MediaAsset[],
    useSearch: boolean = false
): Promise<{ text: string, sources?: GroundingSource[], generatedAssets?: any[], openImageStudio?: string }> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API Key não configurada. Configure em .env.local ou via onboarding.');
    }
    const ai = new GoogleGenAI({ apiKey });
    const contents: Content[] = [];
    
    // Switch between Search Grounding AND Function Declarations
    // They are mutually exclusive in the current API version for safety/stability
    const currentTools: Tool[] = useSearch 
        ? [{ googleSearch: {} }] 
        : chatTools;

    const searchInstruction = useSearch 
        ? "\n\n[MODO PESQUISA ATIVO]: Você tem acesso ao Google Search. Use-o para fornecer informações atualizadas e factuais. Cite suas fontes."
        : "\n\n[MODO AGENTE ATIVO]: Você tem acesso às ferramentas do sistema (Stage, Imagem). Não invente dados externos.";

    const systemInstruction = `${taliaPersona}\n\nLead Architect: ${userName || 'User'}${searchInstruction}`;

    // Reconstruct history with media and filter invalid parts
    for (const msg of history) {
        const msgParts: Part[] = [];
        
        // Add text if present
        if (msg.text && msg.text.trim() !== "") {
            msgParts.push({ text: msg.text });
        }
        
        // Add media from history
        if (msg.mediaAssets && msg.mediaAssets.length > 0) {
            for (const blob of msg.mediaAssets) {
                const base64 = await blobToBase64(blob);
                msgParts.push({ inlineData: { mimeType: blob.type, data: base64 } });
            }
        }

        // Only add message to contents if it has at least one valid part
        if (msgParts.length > 0) {
            contents.push({ role: msg.role, parts: msgParts });
        }
    }

    const userParts: Part[] = [];
    
    // Add Context (Stage Assets)
    if (stageAssets && stageAssets.length > 0) {
        const assetParts = await prepareAssetParts(stageAssets);
        userParts.push(...assetParts);
    }
    
    // Add New Attachments
    if (files && files.length > 0) {
        for (const file of files) {
            const base64 = await blobToBase64(file);
            userParts.push({ inlineData: { mimeType: file.type, data: base64 } });
        }
    }
    
    // Add New Text
    if (newMessage && newMessage.trim() !== "") {
        userParts.push({ text: newMessage });
    }

    // Critical check: Ensure the final user turn is not empty
    if (userParts.length === 0) {
        // If everything is empty (rare edge case), force a placeholder to avoid 400
        userParts.push({ text: "..." });
    }

    contents.push({ role: 'user', parts: userParts });

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Modelo Gemini 3 Pro - mais avançado
        contents: contents,
        config: { 
            systemInstruction, 
            tools: currentTools,
        }
    });
    
    const generatedAssets: any[] = [];
    let openImageStudio: string | undefined = undefined;
    
    if (response.functionCalls) {
        for (const fc of response.functionCalls) {
            if (fc.name === 'salvar_ativo_no_stage') {
                const { nome, conteudo, tipo } = fc.args as unknown as SaveAssetArgs;
                if (nome === "Sessao_Voz_Log.md") continue;
                const blob = new Blob([conteudo], { type: tipo === 'codigo' ? 'text/plain' : 'text/markdown' });
                generatedAssets.push({ blob, type: tipo, fileName: nome, source: 'generated' });
            } else if (fc.name === 'abrir_estudio_de_imagem') {
                openImageStudio = (fc.args as unknown as OpenImageStudioArgs).prompt_sugerido;
            } else if (fc.name === 'gerar_imagem_imediata') {
                const prompt = (fc.args as unknown as GenerateImageArgs).prompt_em_ingles;
                const blob = await generateImageAsset(prompt);
                if (blob) {
                    const safeName = cleanFilename(prompt);
                    generatedAssets.push({ blob, type: 'imagem', fileName: safeName, source: 'generated', prompt });
                }
            }
        }
    }

    // Extração de Grounding (Fontes)
    let sources: GroundingSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    
    if (groundingMetadata?.groundingChunks) {
        sources = groundingMetadata.groundingChunks
            .map((chunk: any) => {
                if (chunk.web) {
                    return { uri: chunk.web.uri, title: chunk.web.title };
                }
                return null;
            })
            .filter((source: any) => source !== null) as GroundingSource[];
    }

    return { 
        text: response.text || (generatedAssets.length > 0 ? "Ação executada no Stage." : ""), 
        sources: sources,
        generatedAssets,
        openImageStudio
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("400")) {
        return { text: "Erro de comunicação: O contexto da conversa pode estar muito complexo ou conter dados inválidos. Tente limpar o histórico ou simplificar o pedido." };
    }
    return { text: "Erro crítico no Núcleo Talia." };
  }
};

export const generateImageWithConfig = async (config: ImageGenerationConfig): Promise<Blob | null> => {
    console.log('[ImageGen] Starting generation with config:', config);
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('[ImageGen] API Key não configurada');
        throw new Error('API Key não configurada');
    }
    console.log('[ImageGen] API Key OK');
    
    const ai = new GoogleGenAI({ apiKey });
    // Modelo GA (Generally Available) que suporta aspect ratio
    const model = 'gemini-2.5-flash-image';
    console.log('[ImageGen] Using model:', model);
    
    try {
        // Usando generateContent com responseModalities: ['IMAGE']
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: config.prompt }] },
            config: {
                responseModalities: ['IMAGE'],
                imageConfig: {
                    aspectRatio: config.aspectRatio // "1:1", "16:9", "9:16", etc.
                }
            }
        });
        console.log('[ImageGen] Response received:', response);
        
        // Processar resposta - imagem vem em candidates[0].content.parts
        const candidates = response.candidates;
        console.log('[ImageGen] Candidates:', candidates);
        
        if (!candidates || candidates.length === 0) {
            console.error('[ImageGen] No candidates in response');
            return null;
        }
        
        const content = candidates[0]?.content;
        console.log('[ImageGen] Content:', content);
        
        if (!content || !content.parts) {
            console.error('[ImageGen] No content or parts in response');
            return null;
        }
        
        // Procurar parte com inlineData (imagem)
        for (const part of content.parts) {
            if (part.inlineData?.data) {
                console.log('[ImageGen] Image part found:', part.inlineData.mimeType);
                const imageData = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                
                console.log('[ImageGen] Decoding base64 image...');
                const bytes = atob(imageData);
                const array = new Uint8Array(bytes.length);
                for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
                
                console.log('[ImageGen] Blob created successfully');
                return new Blob([array], { type: mimeType });
            }
        }
        
        console.error('[ImageGen] No inlineData found in response parts');
        return null;
    } catch (error) {
        console.error('[ImageGen] Error during generation:', error);
        throw error;
    }
};

export const generateImageAsset = async (prompt: string): Promise<Blob | null> => {
    return generateImageWithConfig({ prompt, aspectRatio: '1:1', imageSize: '1K' });
};

export const generateTitleForSession = async (messages: ChatMessage[]): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key não configurada');
    const ai = new GoogleGenAI({ apiKey });
    const text = messages.slice(0, 5).map(m => m.text).filter(t => t.trim() !== "").join('\n');
    if (!text.trim()) return "Nova Conversa";
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Modelo Gemini 3 Flash - rápido e inteligente
        contents: `Analise a intenção e gere um título elegante em português (máx 4 palavras):\n\n${text}`
    });
    return response.text?.replace(/[".]/g, '') || "Nova Conversa";
};

export const generateDocumentFromConversation = async (messages: ChatMessage[], title: string, formatConfig: any): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key não configurada');
    const ai = new GoogleGenAI({ apiKey });
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Gere um documento Markdown para "${title}" baseado no histórico e configs (${JSON.stringify(formatConfig)}):\n\n${text}`
    });
    return response.text || "";
};

export const analyzeConversationForReports = async (messages: ChatMessage[]): Promise<any[]> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key não configurada');
    const ai = new GoogleGenAI({ apiKey });
    const text = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Modelo Gemini 3 Flash - rápido e inteligente
        contents: `Identifique tarefas e gere um relatório JSON.\n\n${text}`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "[]"); } catch { return []; }
};

export const getYouTubeTranscript = async (id: string) => "";
export const generateTranslation = async (t: string) => ({ translation: "" });
