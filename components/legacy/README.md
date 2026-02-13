# LEGADO - Componentes e Caminhos Descontinuados

> Este documento documenta componentes e arquivos que NÃO fazem parte do fluxo principal de producao atual.

## Visão Geral

O projeto atual esta focado em um fluxo centralizado em `App.tsx` que orquestra `MemorySidebar` + `StageCanvas` + `TaliaCorePanel`. Componentes nesta pasta foram preservados para:
- Referencia futura de refatoracao
- Manutencao de compatibilidade reversa
- Documentacao de caminhos de desenvolvimento alternativos

## Componentes no Legacy

### AnchorView.tsx
**Status:** Descontinuado
**Fluxo Alternativo:** Anteriormente usado como view central de chat
**Usos Conhecidos:** Nenhum (totalmente desvinculado do fluxo principal)
**Acao Recomendada:** Revisar necessidade de preservacao ou remover

**Interfaces e Hooks Usados:**
- `useGeminiLive`: Voz
- `useDataStore`: Mensagens
- `useMediaAssets`: Anexos

**Dependencias:**
- `../hooks/useGeminiLive`
- `../hooks/useDataStore`
- `../hooks/useMediaAssets`
- `../components/CameraModal`
- `../components/Chat/MessageBubble`
- `../components/History/ExportModal`

---

### Sidebar.tsx
**Status:** Descontinuado
**Fluxo Alternativo:** Anteriormente responsavel por sessions e arquivos
**Usos Conhecidos:** Nenhum (totalmente desvinculado do fluxo principal)
**Acao Recomendada:** Revisar necessidade de preservacao ou remover

**Interfaces e Hooks Usados:**
- `../hooks/useProjects`
- `../hooks/useSessions`
- `../hooks/useArchives`
- `../hooks/useLocalStorage`
- `../hooks/useDataStore`

**Dependencias:**
- `../components/FormatsPanel`
- `../components/Generation/GenerationOrchestrator`
- `../components/History/ArchiveViewerModal`
- `../components/icons/Icons`

---

### TranslatorView.tsx
**Status:** Descontinuado
**Fluxo Alternativo:** Modo de traducao/transcricao de YouTube
**Usos Conhecidos:** Nenhum (backend de proxy nao esta implantado)
**Acao Recomendada:** Revisar necessidade de preservacao ou remover

**Restricoes Atuais:**
- `YOUTUBE_PROXY_URL` esta vazio
- `services/geminiService.ts:400-401` tem stubs para traducao
- Backend Cloud Function para proxy de transcricao nao esta implantado

**Interfaces e Hooks Usados:**
- N/A (componente autossuficiente)

**Dependencias:**
- `../services/geminiService` (transcricao/translacao)
- `../components/icons/Icons`

---

### History/ (Pasta Completa)
**Conteudo:**
- `ExportModal.tsx`: Modal para exportar relatorio de conversa
- `ArchiveViewerModal.tsx`: Visualizador de documentos arquivados

**Status:** Descontinuado
**Observacao:** `ExportModal.tsx` nao tem usos ativos. `ArchiveViewerModal.tsx` nao tem usos ativos.

**Acao Recomendada:** Avaliar necessidade de preservacao ou remover

---

### AssetDeck.tsx
**Status:** Descontinuado
**Fluxo Alternativo:** Anteriormente responsavel por drag-and-drop de assets no stage
**Usos Conhecidos:** Nenhum (StageCanvas agora tem import inline)
**Acao Recomendada:** Revisar necessidade de preservacao ou remover

## Mapa de Dependencias

```
Memória do Fluxo Ativo:
├── App.tsx
│   ├── MemorySidebar.tsx (ativo)
│   ├── StageCanvas.tsx (ativo)
│   ├── TaliaCorePanel.tsx (ativo)
│   ├── Header.tsx (ativo)
│   ├── ImageStudioOverlay.tsx (ativo)
│   ├── BackgroundSelector.tsx (ativo)
│   └── OnboardingModal.tsx (ativo)

Dependências Compartilhadas (Ativas):
├── hooks/useProjects.ts (ativo)
├── hooks/useSessions.ts (ativo)
├── hooks/useArchives.ts (ativo)
├── hooks/useLocalStorage.ts (ativo)
├── hooks/useMediaAssets.ts (ativo)
├── hooks/useDataStore.ts (ativo)
├── hooks/useGeminiLive.ts (ativo)
└── services/geminiService.ts (ativo)
└── services/db.ts (ativo)

Componentes Legacy (Arquivados):
├── legacy/AnchorView.tsx
├── legacy/Sidebar.tsx
├── legacy/TranslatorView.tsx
├── legacy/AssetDeck.tsx
└── legacy/History/
    ├── ExportModal.tsx
    └── ArchiveViewerModal.tsx
```

## Acoes Recomendadas

### Fase 1: Avaliacao (Hoje)
1. Revisar cada componente legado
2. Verificar se ha testes ou referencias em uso
3. Verificar dependencias externas (Youtube proxy, etc)

### Fase 2: Limpeza (Esta Sprint)
1. **Opcao A (Conservadora):** Manter todos em legacy com documentacao clara
2. **Opcao B (Agresiva):** Remover completamente e revisar dependencias

### Fase 3: Refactorizacao (Próximas Sprints)
1. Se o fluxo legado tiver valor futuro, portar para estrutura atual
2. Consolidar hooks comuns em camadas compartilhadas
3. Atualizar todos os imports para refletir nova arquitetura

## Introducao de Breaking Changes

Se decidir remover algum componente legado, atente para:
1. `App.tsx` nao importa nada de `legacy/`
2. Nenhum arquivo ativo importa de `legacy/` (verificar com `grep -r "from.*legacy"`)
3. Nenhum teste referencia `legacy/`

## Check de Integridade

Executar:
```bash
# Verificar se ha imports de legacy em arquivos ativos
grep -r "from.*legacy" components/ src/ --include="*.tsx" --include="*.ts"
# Se retornar vazio, seguro para remocao
```

---

**Gerado:** 13/02/2026
**Versao:** 1.0
**Responsavel:** Talia Core Team
