# 🚀 DEPLOYMENT GUIDE - Guia de Deploy

**Data:** 13/02/2026
**Versão:** 1.0

---

## 📋 PREPARAÇÃO PARA DEPLOY

### 1. Verificar Preparação

```bash
cd "D:\Dev_BD\DEV_BD_01\RABELUS_LAB\SANDBOX\LAB1\talia_raw_material"

# Todos os checks devem passar
npm run typecheck         # ✅ Sem erros
npm run lint              # ⚠️  Apenas warnings previsíveis
npm run test              # ✅ 3/3 tests passando
npm run build             # ✅ 1.66s sem erros
```

### 2. Build de Produção

```bash
npm run build
```

**Saída Esperada:**
```
vite v6.4.1 building for production...
transforming...
✓ 135 modules transformed.
rendering chunks...
computing gzip size...
  index.html                3.57 kB │ gzip:   1.38 kB
  assets/index-XXXX.js     781 kB │ gzip: 227 kB
✓ built in 1.66s
```

**Output:**
- `dist/index.html` - HTML principal
- `dist/assets/` - JavaScript bundle e assets

### 3. Preview do Build

```bash
npm run preview
```

**URL:** http://localhost:4173 (porta automática)

---

## 🌐 DEPLOYMENT PLATAFORMAS

### Vercel (Recomendado)

**1. Instalar Vercel CLI:**
```bash
npm install -g vercel
```

**2. Login:**
```bash
vercel login
```

**3. Deploy:**
```bash
vercel
```

**4. Setup de Variável de Ambiente:**
```
VITE_GEMINI_API_KEY= sua_chave_aqui
```

**5. Domínio Customizado:**
```bash
vercel domains add talia.ai
```

### Netlify

**1. Construir:** `npm run build`

**2. Upload dist/:**
- Arraste pasta `dist/` para Netlify Drop

**3. Configurar Build Command:**
```bash
npm run build
```

**4. Output Directory:**
```
dist/
```

**5. Variáveis de Ambiente:**
- Configure `VITE_GEMINI_API_KEY` no painel do Netlify

### S3/CloudFront

**1. Upload do Build:**
```bash
# Criar bucket S3
aws s3 mb s3://talia-ai

# Upload
aws s3 sync dist/ s3://talia-ai --delete

# Habilitar CloudFront
# Configure o painel do CloudFront para apontar para o bucket S3
```

---

## 🔐 CONFIGURAÇÃO DE API KEY

### Opção 1: Variável de Ambiente (Produção)

**Vercel:**
```bash
vercel env add VITE_GEMINI_API_KEY
```

**Netlify:**
- Vá em Site Settings → Environment variables
- Adicione: `VITE_GEMINI_API_KEY` com valor da chave

**S3/CloudFront:**
```bash
aws s3 cp .env s3://talia-ai/
```

### Opção 2: Interface de Onboarding (Desenvolvimento)

**Primeira Execução:**
- O aplicativo exibe onboarding
- Interface pede a API Key
- Salva em localStorage

**⚠️ NÃO recomendado para produção** - O localStorage não persiste após refresh.

---

## 🎨 CONFIGURAÇÃO DE DOMÍNIO

### Vercel

```bash
vercel domains add talia.ai
```

### Netlify

1. Painel do Netlify
2. Site Settings → Domains
3. Adicionar domínio: `talia.ai`
4. Seguir instruções de DNS

### AWS (S3/CloudFront)

**1. CloudFront:**
- Configure origem para S3 bucket
- Configure SSL/TLS (ACM)

**2. Route 53:**
- Configure A record apontando para CloudFront

**3. Certificado (ACM):**
- Create Certificate in us-east-1
- Validate via email
- Attach to CloudFront distribution

---

## 📊 MONITORING E LOGS

### Vercel

**1. Ver Logs:**
```bash
vercel logs
```

**2. Analytics:**
- Vercel Analytics dashboard
- Performance metrics

### Netlify

**1. Deploy Logs:**
- Netlify dashboard → Deploy logs

**2. Functions:**
- Logs de serverless functions

### S3/CloudFront

**1. CloudFront Logs:**
- Enable logging no CloudFront distribution
- S3 bucket de logs
- Analytics via CloudWatch

---

## 🔄 VERSIONAMENTO

### Semver

**Versão Atual:** `4.1.0-fase2.sprint1.0`

**Estrutura:**
```
major.minor.patch-sprint.revision
```

### Atualizar Versão

**1. No package.json:**
```json
{
  "version": "4.1.0-fase2.sprint1.1"
}
```

**2. Atualizar Changelog:**
```markdown
## [4.1.0-fase2.sprint1.1] - 13/02/2026

### Mudanças
- [feature] descrição
- [fix] descrição
- [refactor] descrição
```

**3. Commit:**
```bash
git add package.json README.md CHANGELOG.md
git commit -m "chore: versão 4.1.0-fase2.sprint1.1"
git tag v4.1.0-fase2.sprint1.1
git push origin master --tags
```

---

## 🧪 TESTES NO DEPLOY

### Pre-Deployment Checklist

- [ ] Build completo com `npm run build`
- [ ] Typecheck sem erros
- [ ] Todos os testes passando
- [ ] API Key configurada corretamente
- [ ] Build size check (package.json `size` script)

### Post-Deployment Checklist

- [ ] Acesso ao site
- [ ] Primeira execução (onboarding)
- [ ] API Key funcional
- [ ] Chat de texto funcionando
- [ ] Voz live funcionando (se configurado)
- [ ] Imagens funcionando
- [ ] Stage Canvas funcionando

---

## 🐛 PROBLEMAS CONHECIDOS NO DEPLOY

### Problema: Console Logs de Produção

**Causa:** Logs de desenvolvimento ainda presentes

**Solução:** Configurar logger para modo produção
```typescript
// utils/logger.ts
const isDevelopment = () => false; // Modificação de produção
```

### Problema: CDN Assets Bloqueados

**Causa:** CORS e CDN não configurados corretamente

**Solução:**
- Vercel: CDN automaticamente configurado
- Netlify: CDN automaticamente configurado
- S3/CloudFront: Configurar CORS no bucket S3

### Problema: IndexedDB Bloqueado

**Causa:** Mesmo domínio + arquivo diferente

**Solução:** Usar `localStorage` como fallback

---

## 🔒 SEGURANÇA

### CORS Configuration (S3)

**Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::talia-ai/*"
    }
  ]
}
```

### Rate Limiting

**Aplicar em:**
- Gemini API calls
- Serverless functions (Netlify/Vercel)

---

## 📞 SUporte

### Documentação

- `PROJECT_STATUS.md` - Estado atual do projeto
- `MIGRATION_GUIDE.md` - Guia de migração
- `README.md` - Documentação principal
- `LEGACY.md` - Referência de legado

### Logs

**Debug:**
```bash
npm run build --debug
npm run dev --debug
```

**Analysis:**
```bash
npm run typecheck --verbose
npm run lint --format json
```

---

**Versão:** 1.0
**Data:** 13/02/2026
**Status:** PRONTO PARA DEPLOY
