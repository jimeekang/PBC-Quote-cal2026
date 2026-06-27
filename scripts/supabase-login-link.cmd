@echo off
setlocal DisableDelayedExpansion

cd /d "%~dp0.."

echo Paste your Supabase Personal Access Token.
echo It must start with sbp_ and will not be printed back.
echo.
set /p SUPABASE_ACCESS_TOKEN=Supabase sbp token: 

if "%SUPABASE_ACCESS_TOKEN%"=="" (
  echo.
  echo No token entered.
  exit /b 1
)

if /i not "%SUPABASE_ACCESS_TOKEN:~0,4%"=="sbp_" (
  echo.
  echo Invalid token format. Supabase CLI tokens must start with sbp_.
  set "SUPABASE_ACCESS_TOKEN="
  exit /b 1
)

echo.
echo Logging in to Supabase CLI...
call ".\node_modules\.bin\supabase.cmd" login --name pbc-quote-cal --token "%SUPABASE_ACCESS_TOKEN%"
set "SUPABASE_ACCESS_TOKEN="

if errorlevel 1 (
  echo.
  echo Supabase login failed.
  exit /b 1
)

echo.
echo Checking Supabase projects...
call ".\node_modules\.bin\supabase.cmd" projects list
if errorlevel 1 (
  echo.
  echo Supabase project list failed.
  exit /b 1
)

echo.
echo Linking this repo to project ojcrfgguhbxhtlgdflzp...
call ".\node_modules\.bin\supabase.cmd" link --project-ref ojcrfgguhbxhtlgdflzp
if errorlevel 1 (
  echo.
  echo Supabase link failed.
  exit /b 1
)

echo.
echo Supabase CLI login and project link complete.
