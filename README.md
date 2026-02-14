# Talia.ai - Raw Material

**Talia.ai Multimodal Studio** - Material bruto/RAW do projeto.

> Esta é uma versão limpa do Talia.ai, sem frameworks de metodologia, documentação de processo ou configurações específicas de IDE.

## 📋 Sobre

Talia.ai é um studio multimodal avançado para assistência linguística, oferecendo suporte integrado a áudio, vídeo e texto através da API Google Gemini.

### Funcionalidades

- 💬 **Chat de Texto** - Interface conversacional com Gemini 3 Pro/Flash
- 🎙️ **Live API (Voz)** - Comunicação em tempo real via áudio
- 🎨 **Image Studio** - Geração de imagens com múltiplos aspect ratios
- 📁 **Gestão de Projetos** - Organização hierárquica (Projetos → Sessões)
- 🖼️ **Stage Canvas** - Área de trabalho visual com drag-and-drop

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn
- API Key do Gemini (pode ser configurada posteriormente)

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Configuracao Inicial

**API Key (Gemini):**
- A chave pode ser definida via interface de onboarding na primeira execução
- Ou configurada manualmente no localStorage via comando:
  ```bash
  npm run env:set-key
  ```
- A chave pode ser salva em variaveis de ambiente do sistema (recomendado para producao)

### Desenvolvimento

**Workflow Padrão:**
1. Clone e instale: `npm install && npm run dev`
2. Use TypeScript typecheck: `npm run typecheck`
3. Verifique estilo: `npm run lint`
4. Teste: `npm run test`
5. Build: `npm run build`

**Debugging:**
- Voz live: `hooks/useGeminiLive.ts`
- Storage: IndexedDB via DevTools
- Logs: Browser console

**Contribuicao:**
- Apenas warnings aceitos
- Typecheck deve passar (sem erros)
- Sem mudança de comportamento funcional

## 🔧 Scripts

| Script | Descricao |
|--------|-----------|
| `npm run dev` | Servidor dev (http://localhost:3000) |
| `npm run build` | Build de producao |
| `npm run preview` | Preview do build |
| `npm run test` | Roda testes (vitest) |
| `npm run lint` | Verifica estilo (eslint) |
| `npm run typecheck` | Verifica TypeScript |
| `npm run quality:check` | Lint + Typecheck + Tests |
| `npm run env:set-key` | Define API Key (localStorage) |

## 📁 Estrutura

Ver secao "🏗️ Arquitetura e Fluxo Ativo" acima para estrutura detalhada.

> **Nota:** API Key pode ser configurada via interface de onboarding (localStorage) ou pelo script `npm run env:set-key`

## 🛠️ Stack Tecnológica

- **Frontend:** React 19.2.3 + TypeScript 5.8.2
- **Build:** Vite 6.2.0
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API (via GenAI SDK)
- **Storage:** Dexie (IndexedDB)
- **Testing:** Vitest 4.0.18

## 🎯 Modo Tradutora

> **STATUS: Descontinuado** | **Decisao Atual: Manter como Legado**

O modo Tradutora NÃO esta ativo no fluxo principal de producao.

### Por que esta descontinuado?

1. **Backend Proxy Nao Implementado:** Acao requer um backend Cloud Function (YouTube Proxy) para buscar transcricoes, mas esse backend NAO foi implantado.
2. **YOUTUBE_PROXY_URL Vazio:** O endpoint de proxy esta configurado como string vazia no `services/geminiService.ts`.
3. **Codigo Stub:** As funcoes de transcricao/translacao em `services/geminiService.ts:400-401` sao stubs (implementacoes placeholders).

### Dependencias do Modo Tradutora

Se decidir reativar no futuro, sera necessario:
1. Implantar Cloud Function do YouTube Proxy
2. Configurar `YOUTUBE_PROXY_URL` em `services/geminiService.ts`
3. Implementar proxy em `youtube-proxy-backend/index.js`

### Como Visitar (Caso Ainda Tenha Codigo)

O componente ainda existe e pode ser acessado em `components/legacy/TranslatorView.tsx`:

```bash
# Nao recomendado para uso atual
cd components/legacy
cat TranslatorView.tsx
```

**Nota:** O componente esta desabilitado no fluxo ativo e NAO exposto para o usuario.

---

## 🏗️ Arquitetura e Fluxo Ativo

### Estrutura de Pastas

```
talia_raw_material/
├── App.tsx              # Orquestrador principal
├── components/          # Componentes React
│   ├── core/           # Componentes ativos (diretamente usados por App)
│   │   ├── MemorySidebar.tsx
│   │   ├── StageCanvas.tsx
│   │   ├── TaliaCorePanel.tsx
│   │   ├── Header.tsx
│   │   ├── ImageStudioOverlay.tsx
│   │   ├── BackgroundSelector.tsx
│   │   └── OnboardingModal.tsx
│   ├── icons/          # Ícones (Lucide React)
│   ├── Chat/           # Componentes de chat (MessageBubble)
│   └── legacy/         # Componentes descontinuados (preservados para referencia)
│       ├── AnchorView.tsx
│       ├── Sidebar.tsx
│       ├── TranslatorView.tsx
│       ├── AssetDeck.tsx
│       └── History/
├── hooks/              # Custom React hooks
│   ├── useProjects.ts
│   ├── useSessions.ts
│   ├── useArchives.ts
│   ├── useLocalStorage.ts
│   ├── useMediaAssets.ts
│   ├── useDataStore.ts
│   └── useGeminiLive.ts
├── services/           # Serviços
│   ├── geminiService.ts
│   └── db.ts
├── src/                # Testes (vitest)
├── public/             # Assets estáticos
└── ...config files
```

### Orquestracao do App.tsx

```
App.tsx
├── State Global
│   ├── Projects (useProjects)
│   ├── Sessions (useSessions)
│   ├── Assets (useMediaAssets)
│   ├── Archives (useArchives)
│   ├── Backgrounds (BackgroundSelector)
│   └── Auto-resize timer
├── Componentes
│   ├── MemorySidebar (projetos e sessions)
│   ├── StageCanvas (assets visuais)
│   ├── TaliaCorePanel (chat e voz)
│   ├── Header (autonomia, usuario)
│   ├── ImageStudioOverlay (generacao de imagem)
│   ├── BackgroundSelector (fundos personalizados)
│   └── OnboardingModal (onboarding inicial)
└── Servicos
    ├── Gemini API (chat, voz, imagem)
    └── Dexie (IndexedDB)
```

### Fluxo de Dados

```
Usuário → App
    ↓
MemorySidebar
    ↓ (projeto/session selecionado)
App
    ↓
StageCanvas (renderiza assets)
    ↓
TaliaCorePanel (renderiza chat e controles)
    ↓
Hooks
    ↓
Gemini API / Dexie
```

### Documentacao de Legado

**Importante:** Se precisar revisar fluxos antigos ou componentes descontinuados, consulte:
- `LEGACY.md` - Referencia rapida de componentes legado
- `components/legacy/README.md` - Documentacao detalhada de cada componente legado

### Mudancas Recentes (Fase 2)

- 📁 Criada estrutura de pastas `components/legacy/`
- 📁 Migrados componentes descontinuados para `components/legacy/`
- 📝 Documentada arquitetura atual em `README.md`
- 📝 Criado `LEGACY.md` com referencia rapida
- 📝 Criado `components/legacy/README.md` com contexto detalhado

## 📄 Legado (Components Descontinuados)

> Componentes e fluxos que NÃO fazem parte do fluxo principal de producao.

Consulte `LEGACY.md` para detalhes completos de componentes arquivados em `components/legacy/`.

Fluxos legados incluem:
- AnchorView (chat antigo)
- Sidebar (UI de navegação antiga)
- TranslatorView (tradutor YouTube)
- AssetDeck (drag-and-drop antigo)
- History Panel ( paineis de exportacao/arquivo )

Estes componentes foram preservados para referencia futura, mas NAO sao usados pelo fluxo atual.

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run test` - Executar testes
- `npm run lint` - Verificar linting
- `npm run typecheck` - Verificar TypeScript
- `npm run env:set-key` - Prompt interativo para definir/alterar API Key (localStorage)

## 📝 Configuração

**API Key (Gemini):** A chave pode ser definida via localStorage com a chave `talia_api_key` ou configurada interativamente via comando:

```bash
npm run env:set-key
```

Isso também pode ser feito na interface de onboarding na primeira execução.

> **Recomendação:** Salvar a chave preferencialmente em variáveis de ambiente do seu sistema (não versionadas).

## 📄 Licença

Este é material de referência/exemplo.

---

*Versão RAW - Material Bruto*

---

## 📚 DOCUMENTAÇÃO ESPECÍFICA

### Para Retomar Desenvolvimento

1. **🟢 PROJECT_STATUS.md**
   - Estado geral do projeto
   - Contexto e arquitetura
   - Principais conquistas
   - Próximos passos recomendados
   - Guia para atualizações

2. **🔄 MIGRATION_GUIDE.md**
   - Guia de migração de legado para ativo
   - Como mover componentes do legacy/ para core/
   - Checklist de validação
   - Exemplos práticos

3. **🏛️ LEGACY.md**
   - Referência rápida de componentes legado
   - Status de cada componente
   - Dependências e requerimentos

4. **🗂️ components/legacy/README.md**
   - Documentação detalhada de cada componente legado
   - Status atual
   - Motivos de descontinuação
   - Recomendações

---

**Nota:** Antes de fazer qualquer mudança, verifique estas documentações para não quebrar o fluxo existente.

