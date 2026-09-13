@echo off
setlocal
cd /d "%~dp0"

echo =====================================================
echo  Parqueo Privados GT - React + Vite + TypeScript
echo =====================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado o no esta en PATH.
  echo Instala Node.js y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias por primera vez...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install fallo.
    pause
    exit /b 1
  )
)

echo.
echo Backend esperado: http://localhost:3000/api
echo Frontend: http://localhost:5173
echo.
call npm run dev

if errorlevel 1 (
  echo.
  echo El frontend termino con error.
  pause
)
endlocal
