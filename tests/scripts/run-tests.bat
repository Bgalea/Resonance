@echo off
REM Helper script to run tests without PowerShell execution policy issues

echo Running unit tests...
node ..\..\node_modules\vitest\vitest.mjs -c ..\config\vitest.config.js

pause
