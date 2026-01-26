@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM =========================================================
REM CFO-X SaaS - Iniciar ambiente local
REM Execute: start.bat
REM =========================================================

echo.
echo ========================================
echo    Iniciando CFO-X SaaS
echo ========================================
echo.

REM =========================================================
REM 1) Verificar se o Docker está rodando (Docker Desktop/daemon)
REM =========================================================
echo Verificando Docker...

where /q docker
if errorlevel 1 (
    echo [ERRO] Docker CLI nao encontrado no PATH.
    echo Instale o Docker Desktop e reinicie o terminal.
    pause
    exit /b 1
)

REM Testa se o daemon responde
docker info >nul 2>&1
if not errorlevel 1 (
    echo Docker OK.
    goto :DOCKER_OK
)

echo Docker nao esta pronto. Tentando iniciar o Docker Desktop...

REM Tenta localizar e iniciar o Docker Desktop
set "DOCKER_DESKTOP_EXE="

if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" set "DOCKER_DESKTOP_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if exist "%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe" set "DOCKER_DESKTOP_EXE=%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"
if exist "%LocalAppData%\Docker\Docker\Docker Desktop.exe" set "DOCKER_DESKTOP_EXE=%LocalAppData%\Docker\Docker\Docker Desktop.exe"

if not defined DOCKER_DESKTOP_EXE (
    echo [ERRO] Nao encontrei o executavel do Docker Desktop.
    echo Abra o Docker Desktop manualmente e rode o script novamente.
    pause
    exit /b 1
)

start "" "%DOCKER_DESKTOP_EXE%"

REM Esperar o Docker ficar pronto (ate 120s)
set /a MAX_WAIT=120
set /a WAITED=0

:WAIT_DOCKER
docker info >nul 2>&1
if not errorlevel 1 (
    echo Docker iniciado com sucesso.
    goto :DOCKER_OK
)

timeout /t 2 /nobreak >nul
set /a WAITED+=2

if !WAITED! GEQ !MAX_WAIT! (
    echo [ERRO] Docker nao ficou pronto em !MAX_WAIT! segundos.
    echo Verifique se o Docker Desktop abriu corretamente e se o WSL2 esta ok.
    pause
    exit /b 1
)

echo Aguardando Docker... (!WAITED!/!MAX_WAIT!s)
goto :WAIT_DOCKER

:DOCKER_OK

REM =========================================================
REM 2) Subir containers
REM =========================================================
echo.
echo Subindo containers Docker...
docker-compose up -d

REM Aguardar banco ficar pronto
echo.
echo Aguardando banco de dados...
timeout /t 10 /nobreak >nul

REM Inicializar banco
echo.
echo Inicializando banco de dados...
docker-compose exec -T backend python init_db.py

REM Status
echo.
echo Status dos containers:
docker-compose ps
echo.

REM Sucesso!
echo.
echo ========================================
echo   CFO-X SaaS esta rodando!
echo ========================================
echo.
echo URLs de Acesso:
echo   Frontend:       http://localhost:5173
echo   Backend API:    http://localhost:8000
echo   API Docs:       http://localhost:8000/api/docs
echo   Database:       localhost:5432
echo.
echo Credenciais padrao (dev):
echo   Email:    admin@cfohub.com
echo   Senha:    admin123
echo.
echo Comandos uteis:
echo   Ver logs:        docker-compose logs -f
echo   Parar tudo:      docker-compose down
echo   Reiniciar:       start.bat
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Abrir navegador
start http://localhost:8000/api/docs
start http://localhost:5173

REM ================================
REM Verificar e abrir VS Code (se existir)
REM ================================
echo.
echo Verificando VS Code...

where /q code
if not errorlevel 1 (
    echo VS Code encontrado no PATH. Abrindo...
    start "" code .
    goto :END
)

set "VSCODE_EXE="
for %%P in (
    "%LocalAppData%\Programs\Microsoft VS Code\Code.exe"
    "%ProgramFiles%\Microsoft VS Code\Code.exe"
    "%ProgramFiles(x86)%\Microsoft VS Code\Code.exe"
) do (
    if exist "%%~P" set "VSCODE_EXE=%%~P"
)

if defined VSCODE_EXE (
    echo VS Code encontrado. Abrindo...
    start "" "%VSCODE_EXE%" .
) else (
    echo VS Code nao encontrado.
)

:END
endlocal
exit /b 0
