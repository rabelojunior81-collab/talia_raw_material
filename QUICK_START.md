# 🎯 CHECKLIST DE RETOMADA - Quick Start para Agentes

**Data:** 13/02/2026
**Versão:** 1.0

---

## ⚡ QUICK START (Agente Reais)

### 1. Setup Inicial (1 minuto)

```bash
cd "D:\Dev_BD\DEV_BD_01\RABELUS_LAB\SANDBOX\LAB1\talia_raw_material"

# Opcional: Instalar dependências
npm install

# Iniciar servidor
npm run dev
```

**URL:** http://localhost:3000

### 2. Checar Build (1 minuto)

```bash
# Verifica tipo, estilo e testes
npm run quality:check

# Esperado: 0 erros, warnings previsíveis
```

### 3. Criar Commit (2 minutos)

```bash
git add .
git commit -m "type: descrição da mudança"
git push origin master
```

### 4. Testar (1 minuto)

- Acesse http://localhost:3000
- Configure API Key (se necessário)
- Teste funcionalidade principal
- Verifique identidade visual (cores vermelhas)

---

## 📋 DOCUMENTAÇÃO PRINCIPAL

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `README.md` | Documentação geral | Antes de qualquer coisa |
| `PROJECT_STATUS.md` | Estado do projeto | Para entender contexto |
| `MIGRATION_GUIDE.md` | Como migrar legado → ativo | Quando mover componentes |
| `DEPLOYMENT.md` | Guia de deploy | Quando preparar para produção |
| `LEGACY.md` | Referência rápida | Para componentes legado |
| `components/legacy/README.md` | Detalhes legado | Para cada componente legado |

---

## 🎨 IDENTIDADE VISUAL (100% ATIVA)

### O que fazer manter:

1. **`index.html` style tag (linhas 12-99)**
   - Mantém variáveis CSS
   - Mantém animações
   - **NÃO MEXER** - É o coração da marca

2. **tailwind.config no index.html (linhas 26-90)**
   - Mantém cores `talia.red`
   - Mantém animações custom
   - **NÃO MEXER** - Define identidade visual

3. **Efeitos vermelhos**
   - `border-glow-red`
   - `cinematic-glow`
   - Scrollbar hover vermelho
   - **MANTER** em todos os componentes

### O que NÃO fazer:

- ❌ Remover o style tag do index.html
- ❌ Remover o tailwind.config do index.html
- ❌ Remover scripts CDN (markdown-it, DOMPurify)
- ❌ Mudar cores da marca
- ❌ Remover acentos vermelhos dos componentes

---

## 🏗️ ARQUITETURA - O QUE ESTÁ ATIVO

### Fluxo Ativo

```
App.tsx
├── MemorySidebar (projetos e sessions)
├── StageCanvas (assets)
├── TaliaCorePanel (chat e voz)
├── Header (autonomia)
├── ImageStudioOverlay (imagens)
├── BackgroundSelector (fundos)
└── OnboardingModal (onboarding)
```

### Legado (NÃO USAR SEM CONTEXTO)

```
components/legacy/
├── AnchorView.tsx
├── Sidebar.tsx
├── TranslatorView.tsx
├── AssetDeck.tsx
└── History/
```

**Documentação:** `components/legacy/README.md`

---

## 🚀 SCRIPTS DISPONÍVEIS

```bash
npm run dev        # Servidor (porta 3000)
npm run build      # Build de produção
npm run preview    # Preview do build
npm run test       # Testes (3/3 passando)
npm run typecheck  # TypeScript
npm run lint       # Estilo (80 warnings previsíveis)
npm run quality:check  # Tudo junto
npm run deploy:check   # Build + quality
npm run deploy         # Build + preview
```

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

| Problema | Solução |
|----------|---------|
| Tela preta | Limpe cache: Ctrl+Shift+Delete → Images → Clear → Ctrl+F5 |
| Servidor duplicado | Taskkill /F /IM node.exe /T |
| Cor vermelha perdida | index.html style tag e tailwind.config não foram tocados |
| Build quebrado | npm run quality:check |
| Import inexistente | Verifique se o arquivo existe no path correto |
| API Key não funciona | localStorage.setItem('talia_api_key', 'SUA_CHAVE') |

---

## ✅ CHECKLIST ANTES DE COMMITAR

- [ ] Verifique documentação principal (README.md, PROJECT_STATUS.md)
- [ ] Typecheck passou (`npm run typecheck`)
- [ ] Build passou (`npm run build`)
- [ ] Testes passaram (`npm run test`)
- [ ] A API Key funciona (se necessário)
- [ ] Identidade visual intacta (cores vermelhas)
- [ ] Nenhum componente ativo foi movido para legado sem contexto
- [ ] Nenhum componente legado foi movido para ativo sem documentação

---

## 📝 PADRÕES DE CODIFICAÇÃO

### TypeScript

```typescript
// ✅ Bom: Type explícito
interface MyComponentProps {
  id: string;
  name: string;
  age: number;
}

// ❌ Ruim: Type any sem contexto
const func = (data: any) => { ... }
```

### Components

```typescript
// ✅ Bom: Functional component com types
const MyComponent: React.FC<MyProps> = ({ id, name }) => { ... }

// ❌ Ruim: Type any nos props
const MyComponent = (data: any) => { ... }
```

### Hooks

```typescript
// ✅ Bom: Custom hook separado
export const useMyFeature = () => { ... }

// ❌ Ruim: Lógica dentro do component
const Component = () => {
  const data = { ... }; // Lógica inline
}
```

### Services

```typescript
// ✅ Bom: 1 service por arquivo
export const myService = { ... };

// ❌ Ruim: Múltiplos services em um arquivo
export const { serviceA, serviceB, serviceC } = { ... };
```

---

## 🎯 PRÓXIMOS PASSOS (Sempre Documentados)

### Curto Prazo

1. **Retirar console.log de produção**
   - Foco em `hooks/useGeminiLive.ts` e `services/geminiService.ts`
   - Usar utilitário logger criado

2. **Tipagem refinada**
   - Reduzir `any` types
   - Criar types fortes para services

3. **Testing expandido**
   - Hooks
   - Services

### Médio Prazo

1. **Performance**
   - Code-splitting (bundle 677KB)
   - Lazy loading

2. **Accessibility**
   - ARIA
   - Screen reader

---

## 📞 SUPORTO

**Documentação:**
- `PROJECT_STATUS.md` - Estado atual
- `MIGRATION_GUIDE.md` - Guia de migração
- `DEPLOYMENT.md` - Deploy guide
- `LEGACY.md` - Referência legado

**Erros:**
1. Typecheck falhou → Verifique type declarations
2. Build falhou → Verifique vite config
3. Runtime error → Verifique console (F12)
4. Não carrega → Limpe cache e hard refresh
5. Cores perdidas → Verifique index.html style tag

---

## ✨ STATUS DO PROJETO

**Build:** ✅ 1.66s sem erros
**TypeCheck:** ✅ 0 erros
**Linter:** ✅ 80 warnings previsíveis
**Testes:** ✅ 3/3 passando
**Servidor:** ✅ 1 servidor (porta 3000)
**Identidade Visual:** ✅ 100%
**Documentação:** ✅ Completa

**STATUS:** 🟢 PRONTO PARA DESENVOLVIMENTO

---

**Versão:** 1.0
**Data:** 13/02/2026
**Autores:** Talia Core Team
**Maintainability:** 🎯 PRONTO PARA MANTENÇÃO
