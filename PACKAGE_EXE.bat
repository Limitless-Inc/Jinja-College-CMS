@echo off
echo Packaging Jinja College CMS for Windows...
cd /d "%~dp0"
call npm run package
echo Package complete! Installer in dist/ directory
pause
