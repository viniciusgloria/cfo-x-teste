@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Performance Tools - Menu Interativo
:: Ferramentas para gerenciar dados de Performance/CPA

:MENU
cls
echo.
echo                            `-.
echo                -._ `. `-.`-. `-.
echo               _._ `-._`.   .--.  `.
echo            .-'   '-.  `-^|\/    \^|   `-.
echo          .'         '-._\   (o)O) `-.
echo         /         /         _.--.\ '. `-. `-.
echo        /^|    (    ^|  /  -. ( -._( -._ '. '.
echo       /  \    \-.__\ \_.-'`.`.__'.   `-, '. .'
echo       ^|  /\    ^|  / \ \     `--')/  .-'.'.'
echo   .._/  /  /  /  / / \ \          .' . .' .'
echo /  ___/  ^|  /   \ \  \ \__       '.'. . .
echo \  \___  \ (     \ \  `._ `.     .' . ' .'
echo  \ `-._\ (  `-.__ ^| \    )//   .'  .' .-'
echo   \_-._\  \  `-._\)//    ""_.-' .-' .' .'
echo     `-'    \ -._\ ""_..--''  .-' .'
echo             \/    .' .-'.-'  .-' .-'
echo                  .-'.' .'  .' .-'
echo.
echo  Gerenciamento de dados de Performance/CPA
echo.
echo  [1]  SEED - Popular banco com dados de teste
echo  [2]  CLEAR - Limpar dados do banco
echo  [3]  CLEAR + SEED - Limpar e popular novamente
echo  [4]  Sair
echo.
echo ----------------------------------------------------------------
echo.

set /p opcao="?: "

if "%opcao%"=="1" goto SEED
if "%opcao%"=="2" goto CLEAR
if "%opcao%"=="3" goto CLEAR_SEED
if "%opcao%"=="4" goto SAIR

echo.
echo  Opcao invalida! Tente novamente.
timeout /t 2 >nul
goto MENU

:SEED
cls
echo                     SEED - Popular Banco
echo ----------------------------------------------------------------
echo.
echo Populando banco de dados com dados de teste...
echo.
docker exec cfohub-backend python seed_performance_data.py
echo.
echo ----------------------------------------------------------------
echo.
if %errorlevel% equ 0 (
    echo  Seed executado com sucesso!
) else (
    echo  Erro ao executar seed!
)
echo.
pause
goto MENU

:CLEAR
cls
echo                    CLEAR - Limpar Dados
echo ----------------------------------------------------------------
echo.
echo   ATENCAO: Esta operacao ira DELETAR todos os dados!
echo.
set /p confirma="Deseja continuar? (S/N): "

if /i "%confirma%"=="S" (
    echo.
    echo Limpando dados do banco...
    echo.
    docker exec cfohub-backend python clear_performance_data.py --force
    echo.
    echo ----------------------------------------------------------------
    echo.
    if %errorlevel% equ 0 (
        echo  Clear executado com sucesso!
    ) else (
        echo  Erro ao executar clear!
    )
) else (
    echo.
    echo  Operacao cancelada pelo usuario.
)
echo.
pause
goto MENU

:CLEAR_SEED
cls
echo               CLEAR + SEED - Resetar Dados
echo ----------------------------------------------------------------
echo.
echo   ATENCAO: Esta operacao ira:
echo   1. DELETAR todos os dados existentes
echo   2. POPULAR o banco com dados de teste novos
echo.
set /p confirma="Deseja continuar? (S/N): "

if /i "%confirma%"=="S" (
    echo.
    echo [1/2] Limpando dados do banco...
    echo.
    docker exec cfohub-backend python clear_performance_data.py --force
    
    if %errorlevel% equ 0 (
        echo.
        echo  Limpeza concluida!
        echo.
        echo [2/2] Populando banco com dados de teste...
        echo.
        docker exec cfohub-backend python seed_performance_data.py
        
        if %errorlevel% equ 0 (
            echo.
            echo ----------------------------------------------------------------
            echo.
            echo  Reset completo executado com sucesso!
            echo.
            echo  Dados disponiveis para cliente_id=1
        ) else (
            echo.
            echo  Erro ao popular dados!
        )
    ) else (
        echo.
        echo  Erro ao limpar dados! Abortando operacao.
    )
) else (
    echo.
    echo  Operacao cancelada pelo usuario.
)
echo.
pause
goto MENU

:SAIR
cls
echo.
echo    __7__          %%%%,%%%%%%%%
echo    \_._/           ,'%%%% \\-*%%%%%%%%
echo    ^( ^^ ^)     ;%%%%%%*%%   _%%%%
echo     `='^|\.    ,%%%%       \^(_.*%%%%%.
echo       /  ^|    %% *%%%, ,%%%%*^(    '
echo     ^(/   ^|  %%^     ,*%%%% ^)\^|,%%*%%,_
echo     ^|__, ^|       *%%    \/ #^).-*%%*
echo      ^|   ^|           _.^) ,/ *%%,
echo      ^|   ^|   _________/^)#^(_____________
echo      /__^|  ^|__________________________^|
echo      ===
echo.
echo   Até logo!
echo.
timeout /t 1 >nul
exit /b 0
