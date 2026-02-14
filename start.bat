@echo off
REM 🎨 Talia.ai - Inicialização Rápida para Windows
REM Execute este script para iniciar o projeto

echo ========================================
echo   TALIA.AI - STARTUP SCRIPT
echo ========================================
echo.

REM 1. Matar processos antigos
echo 1️⃣  Parando processos antigos...
taskkill /F /IM node.exe /T 2>nul || echo    ✅ Sem processos antigos
timeout /t 2 /nobreak >nul

REM 2. Instalar dependências (se necessário)
echo.
echo 2️⃣  Instalando dependências...
call npm install

REM 3. Build
echo.
echo 3️⃣  Build do projeto...
call npm run build

REM 4. Iniciar servidor
echo.
echo 4️⃣  Iniciando servidor na porta 3000...
echo.
echo ========================================
echo   ✅ SERVIDOR INICIADO!
echo ========================================
echo.
echo 📍 URL: http://localhost:3000
echo.
echo 🧪 Scripts disponíveis:
echo    - npm run dev
echo    - npm run build
echo    - npm run preview
echo    - npm run test
echo    - npm run typecheck
echo    - npm run lint
echo.
echo 📚 Documentação:
echo    - README.md
echo    - PROJECT_STATUS.md
echo    - MIGRATION_GUIDE.md
echo    - DEPLOYMENT.md
echo    - LEGACY.md
echo.
echo 💡 Se não carregar:
echo    Ctrl + Shift + Delete ^> Images ^> Clear
echo    Ctrl + F5 (hard refresh)
echo.
echo ✨ Pronto para desenvolvimento!
echo.

call npm run dev
