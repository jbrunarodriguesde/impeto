@echo off
setlocal
cd /d "%~dp0"
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Instale o Node.js 22 ou superior e abra este arquivo novamente.
  pause
  exit /b 1
)
if not exist node_modules\.bin\next.cmd (
  call npm.cmd ci --no-fund
  if errorlevel 1 goto :falha
)
if not exist .next\BUILD_ID (
  call npm.cmd run build
  if errorlevel 1 goto :falha
)
echo.
echo Abra http://localhost:3000 no navegador quando aparecer "Ready".
echo Use Ctrl+C nesta janela para desligar.
call npm.cmd run start -- --hostname 127.0.0.1
if errorlevel 1 goto :falha
exit /b 0
:falha
echo.
echo A inicializacao falhou. Confira a mensagem acima e o README.
pause
exit /b 1
