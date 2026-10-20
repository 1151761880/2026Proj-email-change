@echo off
setlocal
cd /d "%~dp0"
if not exist ".context\native\node\node.exe" (
  echo Portable Node.js 24 is missing. Complete the initial native runtime setup first.
  pause
  exit /b 1
)
set "PATH=%CD%\.context\native\node;%PATH%"
".context\native\node\node.exe" --import tsx apps/web/scripts/local-dev.ts --backend native %*
if errorlevel 1 pause
