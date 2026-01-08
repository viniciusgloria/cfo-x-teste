@echo off
REM CFO-X SaaS - Iniciar ambiente local
REM Execute: start.bat

echo.
echo ========================================
echo    Iniciando CFO-X SaaS
echo ========================================
echo.

REM Subir containers
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
echo   Email:    admin@example.com
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
start http://localhost:5173
start http://localhost:8000/api/docs
