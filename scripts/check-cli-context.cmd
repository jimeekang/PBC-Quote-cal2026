@echo off
setlocal

pushd "%~dp0.."
set "SUPABASE_CLI=node_modules\.bin\supabase.cmd"

echo.
echo == Git ==
git remote -v
for /f "usebackq delims=" %%A in (`git branch --show-current`) do echo branch: %%A
for /f "usebackq delims=" %%A in (`git config --local --get user.name`) do echo local user.name: %%A
for /f "usebackq delims=" %%A in (`git config --local --get user.email`) do echo local user.email: %%A

echo.
echo == SSH ==
if exist "%USERPROFILE%\.ssh\config" (
  echo ssh config: %USERPROFILE%\.ssh\config
) else (
  echo ssh config: missing
)
if exist "%USERPROFILE%\.ssh\id_ed25519_pbc_quote_cal" (
  echo pbc key: %USERPROFILE%\.ssh\id_ed25519_pbc_quote_cal
) else (
  echo pbc key: missing
)
echo github alias: github-pbc-quote-cal

echo.
echo == Vercel ==
where vercel.cmd
echo Run separately when needed: vercel.cmd whoami
if exist ".vercel\project.json" (
  type ".vercel\project.json"
) else (
  echo .vercel/project.json: missing
)

echo.
echo == Supabase ==
if exist "%SUPABASE_CLI%" (
  call "%SUPABASE_CLI%" --version
  if exist ".mcp.json" (
    echo .mcp.json: present
  ) else (
    echo .mcp.json: missing
  )
  if exist "supabase\.temp\project-ref" (
    echo linked project-ref:
    type "supabase\.temp\project-ref"
  ) else (
    echo linked project-ref: missing
  )
) else (
  echo Supabase CLI: missing
)

echo.
echo == Local env ==
if exist ".env.local" (
  for %%K in (
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    JOBBER_REDIRECT_URI
  ) do (
    findstr /b /c:"%%K=" ".env.local" >nul
    if errorlevel 1 (
      echo %%K: missing
    ) else (
      echo %%K: present
    )
  )
) else (
  echo .env.local: missing
)

popd
endlocal
