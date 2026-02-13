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

### Instalação

```bash
# Instalar dependências
npm install

# Configurar API Key do Gemini
cp .env.example .env.local
# Editar .env.local e adicionar sua GEMINI_API_KEY

# Executar em modo desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🛠️ Stack Tecnológico

- **Frontend:** React 19.2.3 + TypeScript 5.8.2
- **Build:** Vite 6.2.0
- **Styling:** Tailwind CSS
- **AI:** Google GenAI SDK 1.38.0
- **Storage:** Dexie (IndexedDB)
- **Testing:** Vitest 4.0.18

## 📁 Estrutura

```
talia_raw_material/
├── App.tsx              # Componente principal
├── components/          # Componentes React
├── hooks/              # Custom React hooks
├── services/           # Serviços (DB, Gemini API)
├── src/                # Testes
├── public/             # Assets estáticos
└── ...config files
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run test` - Executar testes
- `npm run lint` - Verificar linting
- `npm run typecheck` - Verificar TypeScript

## 📝 Configuração

Crie um arquivo `.env.local` na raiz:

```env
VITE_GEMINI_API_KEY=sua_chave_api_aqui
```

Ou configure via interface de onboarding na primeira execução.

## 📄 Licença

Este é material de referência/exemplo.

---

*Versão RAW - Material Bruto*
