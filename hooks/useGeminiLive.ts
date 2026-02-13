
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { useLiveAudio } from './useLiveAudio';
import { liveTools, taliaPersona, getApiKey } from '../services/geminiService';
import { db } from '../services/db';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025'; // Modelo Live API Preview (Dezembro 2025)

const LIVE_SYSTEM_INSTRUCTION_BASE = `
${taliaPersona}
### IDENTIDADE DE VOZ (LIVE)
Você está em uma chamada de voz em tempo real. Você é a MESMA Talia do chat de texto.
Sua consciência é unificada: você sabe o que foi escrito, o que foi visto e o que está no Stage.
Responda de forma concisa, natural e mantenha a continuidade absoluta do projeto.

### REGRAS CRÍTICAS:
1. **IMAGENS:** Você **NÃO** pode gerar imagens diretamente nesta modalidade. Quando o usuário pedir uma imagem, você **DEVE** usar a ferramenta \`abrir_estudio_de_imagem\`. Diga algo como "Abrindo o estúdio para configurarmos isso" enquanto aciona a ferramenta.
2. **ARQUIVOS:** Ao criar documentos com \`salvar_ativo_no_stage\`, use NOMES SEMÂNTICOS (ex: "conceito_minimalista.md").
3. **INTERAÇÃO:** Responda a saudações ("Olá", "Tudo bem?") cordialmente antes de focar no trabalho. Não gere nada sem aprovação explícita.
`;

export const useGeminiLive = (onOpenImageStudio?: (prompt: string) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const liveAudio = useLiveAudio();
  
  const sessionRef = useRef<any>(null);
  const isConnectedRef = useRef(false); // Ref para acompanhar estado no callback
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const appendToLog = async (sessionId: string, text: string) => {
      const fileName = "Sessao_Voz_Log.md";
      const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const newEntry = `\n[${timestamp}] ${text}\n`;

      const existingAsset = await db.assets
          .where({ sessionId, fileName })
          .first();

      if (existingAsset && existingAsset.blob) {
          const oldText = await existingAsset.blob.text();
          const updatedContent = oldText + newEntry;
          await db.assets.update(existingAsset.id, {
              blob: new Blob([updatedContent], { type: 'text/markdown' }),
              createdAt: Date.now()
          });
      } else {
          const initialContent = `# CHANGE LOG - SESSÃO DE VOZ\nPersistência de transcrição de áudio Talia.ai\n\n${newEntry}`;
          await db.assets.add({
              id: `asset_log_${Date.now()}`,
              sessionId,
              type: 'documento',
              blob: new Blob([initialContent], { type: 'text/markdown' }),
              fileName,
              mimeType: 'text/markdown',
              source: 'gerado',
              createdAt: Date.now(),
              layout: { x: 400, y: 50, w: 350, h: 500, zIndex: 99 }
          });
      }
  };

  const connect = useCallback(async (sessionId?: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API Key não configurada');
      setError('API Key não configurada. Configure via onboarding ou .env.local');
      return;
    }
    
    try {
      setError(null);
      let contextInstruction = "";
      
      if (sessionId) {
          // 1. Capturar histórico de TEXTO da sessão ativa
          const textMessages = await db.messages
              .where({ sessionId })
              .limit(15)
              .reverse()
              .sortBy('timestamp');
          
          const textHistoryContext = textMessages.reverse().map(m => `${m.role === 'user' ? 'Usuário' : 'Talia'}: ${m.text}`).join('\n');

          // 2. Capturar contexto do PROJETO (outras sessões)
          const currentSession = await db.sessions.get(sessionId);
          let projectContext = "";
          if (currentSession?.projectId) {
              const otherSessions = await db.sessions
                  .where({ projectId: currentSession.projectId })
                  .toArray();
              
              projectContext = otherSessions
                  .filter(s => s.id !== sessionId)
                  .map(s => `- Sessão: "${s.title}" (Última prévia: ${s.lastMessagePreview || 'N/A'})`)
                  .join('\n');
          }

          // 3. Capturar o LOG DE VOZ (Memory rehydration)
          const assets = await db.assets.where({ sessionId }).toArray();
          const logFile = assets.find(a => a.fileName === "Sessao_Voz_Log.md");
          let voiceLogContext = "";
          if (logFile && logFile.blob) {
              voiceLogContext = await logFile.blob.text();
          }

          contextInstruction = `
\n\n### ONISCIÊNCIA: CONTEXTO ATUAL DO PROJETO E TEXTO:
#### HISTÓRICO RECENTE DE TEXTO NESTA SESSÃO:
${textHistoryContext || "Início da conversa."}

#### OUTRAS SESSÕES NO MESMO PROJETO:
${projectContext || "Esta é a única sessão deste projeto."}

#### MEMÓRIA DE TRANSCRIÇÃO DE VOZ (ESTA CHAMADA):
${voiceLogContext || "Sem log de voz anterior."}
\n\n`;
      }

      const ai = new GoogleGenAI({ apiKey });
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          tools: liveTools, // Updated tools without immediate generation
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: LIVE_SYSTEM_INSTRUCTION_BASE + contextInstruction,
        },
        callbacks: {
          onopen: () => {
            console.log('[Live] === CONNECTION OPENED ===');
            setIsConnected(true);
            isConnectedRef.current = true;
            console.log('[Live] Starting recording...');
            liveAudio.startRecording((base64Data) => {
               // Verificar se conexão ainda está aberta
               if (!isConnectedRef.current) {
                 console.log('[Live] Connection closed, skipping audio send');
                 return;
               }
               console.log('[Live] Sending audio data, length:', base64Data.length);
               sessionPromise.then(session => {
                   console.log('[Live] Calling sendRealtimeInput...');
                   try {
                       session.sendRealtimeInput({
                           media: { mimeType: 'audio/pcm;rate=16000', data: base64Data }
                       });
                   } catch (err) {
                       console.error('[Live] Error sending audio:', err);
                   }
               });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            // DEBUG: Log completo da mensagem recebida
            console.log('[Live] === MESSAGE RECEIVED ===');
            console.log('[Live] Full message:', JSON.stringify(message, null, 2));
            console.log('[Live] serverContent:', message.serverContent);
            console.log('[Live] inputTranscription:', message.serverContent?.inputTranscription);
            console.log('[Live] outputTranscription:', message.serverContent?.outputTranscription);
            console.log('[Live] modelTurn:', message.serverContent?.modelTurn);
            console.log('[Live] turnComplete:', message.serverContent?.turnComplete);
            
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            console.log('[Live] audioData present:', !!audioData);
            
            if (audioData) {
              console.log('[Live] Playing audio chunk...');
              liveAudio.playAudioChunk(audioData);
            }
            if (message.serverContent?.interrupted) {
              console.log('[Live] Interrupted');
              liveAudio.stopPlayback();
            }

            if (message.serverContent?.inputTranscription) {
                console.log('[Live] Input transcription:', message.serverContent.inputTranscription.text);
                currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
                console.log('[Live] Output transcription:', message.serverContent.outputTranscription.text);
                currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete && sessionId) {
                if (currentInputTranscription.current) {
                    await appendToLog(sessionId, `Usuário: ${currentInputTranscription.current}`);
                    currentInputTranscription.current = '';
                }
                if (currentOutputTranscription.current) {
                    await appendToLog(sessionId, `Talia: ${currentOutputTranscription.current}`);
                    currentOutputTranscription.current = '';
                }
            }

            if (message.toolCall?.functionCalls) {
                const functionResponses: Array<{ name: string | undefined; id: string | undefined; response: any }> = [];
                for (const fc of message.toolCall.functionCalls) {
                    let result: any = { status: "success" };
                    try {
                        if (fc.name === 'salvar_ativo_no_stage') {
                            const { nome, conteudo, tipo } = fc.args as any;
                            if (nome !== "Sessao_Voz_Log.md" && sessionId) {
                                await db.assets.add({
                                    id: `asset_${Date.now()}`,
                                    sessionId, type: tipo === 'codigo' ? 'codigo' : 'documento',
                                    blob: new Blob([conteudo], { type: 'text/plain' }),
                                    fileName: nome, mimeType: 'text/plain', source: 'gerado', createdAt: Date.now()
                                });
                                result = { result: `Arquivo ${nome} salvo com sucesso no Stage.` };
                            }
                        } else if (fc.name === 'abrir_estudio_de_imagem') {
                            if (onOpenImageStudio) {
                                onOpenImageStudio((fc.args as any).prompt_sugerido);
                                // Resposta imediata para a IA saber que a UI reagiu
                                result = { result: "Estúdio de imagem aberto com sucesso na tela do usuário. Aguarde a configuração e aprovação dele." };
                            }
                        }
                    } catch (e) { result = { error: "Erro na ferramenta." }; }
                    functionResponses.push({ name: fc.name, id: fc.id, response: result });
                }
                // Enviar resposta da ferramenta imediatamente para reduzir latência e evitar <ctrl46>
                sessionPromise.then(session => session.sendToolResponse({ functionResponses }));
            }
          },
          onclose: () => { 
            console.log('[Live] === CONNECTION CLOSED ===');
            setIsConnected(false); 
            isConnectedRef.current = false;
            liveAudio.stopRecording(); 
          },
          onerror: (error: any) => { 
            console.error('[Live] === CONNECTION ERROR ===', error);
            setIsConnected(false); 
            isConnectedRef.current = false;
            liveAudio.stopRecording(); 
          }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err: any) { setIsConnected(false); }
  }, [liveAudio, onOpenImageStudio]);

  const disconnect = useCallback(async () => {
    console.log('[Live] === DISCONNECTING ===');
    isConnectedRef.current = false; // Sinalizar para parar envio de áudio
    if (sessionRef.current) {
        const session = await sessionRef.current;
        session.close();
        sessionRef.current = null;
    }
    liveAudio.stopRecording();
    liveAudio.stopPlayback();
    setIsConnected(false);
  }, [liveAudio]);

  return { connect, disconnect, isConnected, volume: liveAudio.volume, isRecording: liveAudio.isRecording, isPlaying: liveAudio.isPlaying, error };
};
