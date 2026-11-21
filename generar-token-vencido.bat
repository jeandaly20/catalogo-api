@echo off
cd /d "%~dp0"
echo Copie este token en la variable token_vencido de Postman:
echo.
npm run -s token:vencido
echo.
pause
