@echo off
echo Building Jinja College CMS...
cd /d "%~dp0"
call npm run build
echo Build complete! Output in build/ directory
pause
