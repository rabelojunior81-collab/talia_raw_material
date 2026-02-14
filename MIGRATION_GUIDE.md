# 🎨 MIGRATION GUIDE - DE LEGADO PARA ATIVO

**Data:** 13/02/2026
**Objetivo:** Orientar qualquer agente sobre como migrar funcionalidades do legado para o fluxo ativo

---

## 📋 COMO SABER SE UM COMPONENTE É LEGADO OU ATIVO

### Checklist Visual:

**ATIVO:** Presente em `components/core/`
- [ ] Está no diretório `components/core/`
- [ ] É importado por `App.tsx`
- [ ] Faz parte do fluxo principal de renderização
- [ ] Está documentado como "ativo"

**LEGADO:** Presente em `components/legacy/`
- [ ] Está no diretório `components/legacy/`
- [ ] NÃO é importado por `App.tsx`
- [ ] Tem comentário "Descontinuado" ou similar
- [ ] Está documentado como "descontinuado"

---

## 🚀 MIGRANTO COMPONENTE DO LEGADO PARA ATIVO

### Passo 1: Verificar Importação

**Verifique se algum componente ativo importa do legado:**

```bash
grep -r "from.*legacy" components/ --include="*.tsx" --include="*.ts"
```

**Se retornar resultado:** Não migre! Mantenha em legacy/ até resolver dependências.

**Se estiver vazio:** ✅ Você pode migrar

### Passo 2: Mover Componente

```bash
mv components/legacy/NomeDoComponente.tsx components/core/
```

### Passo 3: Ajustar Imports Relativos

**Antes (legacy/):**
```typescript
import { Session } from '../../types';
import { MessageBubble } from '../Chat/MessageBubble';
import { useGeminiLive } from '../../hooks/useGeminiLive';
```

**Depois (core/):**
```typescript
import { Session } from '../../../types';
import { MessageBubble } from '../../Chat/MessageBubble';
import { useGeminiLive } from '../../../hooks/useGeminiLive';
```

### Passo 4: Atualizar Documentação

**Atualize `components/legacy/README.md`:**

```markdown
## NomeDoComponente.tsx
**Status:** Descontinuado (MIGRADO)
**Migrado para:** `components/core/`
**Data da migração:** 13/02/2026
**Motivo:** [motivo da migração]
**Testes:** [status dos testes]
```

**Remova da lista de componentes legado no README:**

```markdown
Fluxos legados incluem:
- (Componente migrado) ← REMOVER ESTA LINHA
```

### Passo 5: Adicionar Testes (Se necessário)

**Crie testes em `src/__tests__/`:**

```typescript
import { describe, it, expect } from 'vitest';
import NomeDoComponente from '../components/core/NomeDoComponente';

describe('NomeDoComponente', () => {
  it('deve renderizar sem erros', () => {
    // implementar teste
  });
});
```

### Passo 6: Rodar Quality Checks

```bash
npm run typecheck  # Deve passar sem erros
npm run lint       # Deve ter warnings previsíveis
npm run build      # Deve compilar sem erros
```

### Passo 7: Documentar no README.md

**Adicione ao `README.md`:**

```markdown
## Novo Componente

- NomeDoComponente.tsx (core/) - [descrição]
  - [feature 1]
  - [feature 2]
```

---

## ⚠️ MIGRAÇÕES CUIDADOSAMENTE GERIDAS

### Fluxo Ativo vs Legado

**Fluxo Ativo:**
```
App.tsx
├── MemorySidebar
├── StageCanvas
├── TaliaCorePanel
└── [outros componentes core/]
```

**Fluxo Legado:**
```
components/legacy/
├── AnchorView.tsx
├── Sidebar.tsx
├── TranslatorView.tsx
└── [outros componentes descontinuados]
```

### Dependências

**Dependências de core/:**
- ✅ Hooks: Todos os hooks em `hooks/`
- ✅ Services: `services/geminiService.ts`, `services/db.ts`
- ✅ Utils: `utils/markdown.ts`, `utils/logger.ts`
- ❌ Components legado: NUNCA importar de `components/legacy/`

**Dependências de legacy/:**
- ✅ Hooks: Todos os hooks
- ✅ Services: Todos os serviços
- ✅ Components ativos: NUNCA importar de `components/core/`

---

## 📝 EXEMPLO DE MIGRAÇÃO COMPLETA

### Componente: `ExportModal.tsx`

**1. Status Original:**
```markdown
## ExportModal.tsx
**Status:** Descontinuado
**Motivo:** Não usado no fluxo ativo
```

**2. Análise de Imports:**
```bash
grep -r "ExportModal" components/
# Resultado: Não há importações
```

**3. Migração:**
```bash
mv components/legacy/History/ExportModal.tsx components/core/
```

**4. Ajuste de Imports:**
```typescript
// Antes
import { Session } from '../../../types';

// Depois
import { Session } from '../../types';
```

**5. Atualização Documentação:**
```markdown
## ExportModal.tsx
**Status:** MIGRADO PARA ATIVO ✅
**Data:** 13/02/2026
**Motivo:** Adicionado feature de exportação
**Testes:** 1/1 passando
```

**6. Adicionar Teste:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportModal from '../components/core/ExportModal';

describe('ExportModal', () => {
  it('deve renderizar modal de exportação', () => {
    // implementar
  });
});
```

**7. Quality Checks:**
```bash
npm run typecheck  # ✅ OK
npm run lint       # ⚠️ 0 warnings
npm run build      # ✅ OK (1.2s)
```

**8. Atualização README:**
```markdown
## Componentes Ativos

- ExportModal.tsx (core/) - Modal de exportação de relatórios
  - Exporta conversas completas
  - Formata para PDF/Markdown
```

---

## 🔄 MIGRANDO HOOKS DO LEGADO PARA ATIVO

### Fluxo Similar ao Componente

1. **Verifique usos no App.tsx e componentes core/**
2. **Mova para `hooks/`**
3. **Ajuste imports relativos**
4. **Adicione testes**
5. **Documente**

### Exemplo

**Hook Original:**
```typescript
// hooks/antigoHook.ts
export const useLegacyFeature = () => { ... }
```

**Migração:**
```bash
mv hooks/antigoHook.ts hooks/useNovaFeature.ts
```

**Ajuste Imports:**
```typescript
// Antes
import { useLegacyFeature } from './hooks/antigoHook.ts';

// Depois
import { useNovaFeature } from './hooks/useNovaFeature.ts';
```

---

## 🚫 MIGRAÇÕES QUE NÃO SÃO PERMITIDAS

### Não Migrar Estas:

1. **Tradutora (TranslatorView.tsx)**
   - Motivo: Backend não implementado
   - Ação: Manter em `legacy/`
   - Depois de implementar: Backend proxy + reativar

2. **Animações Duplicadas**
   - Motivo: Efeitos podem conflitar
   - Ação: Reutilizar animações existentes
   - Ou: Documentar conflitos

3. **Terminal/Dashboards Legados**
   - Motivo: UI diferente do design atual
   - Ação: Documentar separadamente
   - Depois de atualizar: Migração completa de UI

---

## ✅ VERIFICAÇÕES ANTES DE MIGRAR

### Checklist Pré-Migração:

- [ ] Verificado que NENHUM componente ativo importa
- [ ] Verificado que NÃO há testes quebrados
- [ ] Verificado que typecheck passa
- [ ] Verificado que build passa
- [ ] Verificado que o componente faz sentido no fluxo ativo
- [ ] Verificado que há motivo claro para migração
- [ ] Verificado que documentação será atualizada

### Checklist Pós-Migração:

- [ ] Todos os imports foram ajustados
- [ ] Documentação foi atualizada
- [ ] Testes foram adicionados (se necessário)
- [ ] Typecheck passou
- [ ] Build passou
- [ ] Lint passou
- [ ] README atualizado
- [ ] Components/legacy/README.md atualizado

---

## 📚 REFERÊNCIAS

- `components/legacy/README.md` - Lista completa de componentes legado
- `README.md` - Documentação geral do projeto
- `LEGACY.md` - Referência rápida de legado
- `PROJECT_STATUS.md` - Status geral do projeto

---

**Versão:** 1.0
**Data:** 13/02/2026
**Status:** PRONTO PARA USO
