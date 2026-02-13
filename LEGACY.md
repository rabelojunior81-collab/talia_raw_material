# Legacy Components - Quick Reference

> Artigos de blog, componentes descontinuados e fluxos alternativos.

## Status

| Componente | Status | Ver Detalhes |
|------------|--------|-------------|
| AnchorView.tsx | 🚫 Descontinuado | `components/legacy/AnchorView.tsx` |
| Sidebar.tsx | 🚫 Descontinuado | `components/legacy/Sidebar.tsx` |
| TranslatorView.tsx | 🚫 Descontinuado | `components/legacy/TranslatorView.tsx` |
| AssetDeck.tsx | 🚫 Descontinuado | `components/legacy/AssetDeck.tsx` |
| History Panel | 🚫 Descontinuado | `components/legacy/History/` |

## Acesso Rápido

```bash
# Ver lista completa de componentes legado
cd components/legacy
cat README.md

# Ver contexto de cada componente
cd components/legacy
ls -la
```

## Para Revisão

Se voce precisa revisar o fluxo antigo ou documentacao de caminhos de desenvolvimento:

```bash
# Abra o documentacao completa
open components/legacy/README.md

# Lista de arquivos
find components/legacy -type f -name "*.tsx" | head -20
```

## Fluxo Ativo (Para Comparação)

**Configuracao Atual:**
- Main Flow: `App.tsx` → `MemorySidebar` + `StageCanvas` + `TaliaCorePanel`
- Hooks: `useProjects`, `useSessions`, `useArchives`, `useLocalStorage`, `useMediaAssets`, `useDataStore`, `useGeminiLive`
- Servicos: `geminiService`, `db`

**Ver documentacao completa do fluxo ativo em `README.md`**

---

**Versão:** 1.0
**Atualizado:** 13/02/2026
