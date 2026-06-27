# CLI-ACCESS.md — 로컬 계정·접근 설정

> GitHub, Vercel, Supabase 계정이 프로젝트별로 다를 때 이 파일을 기준으로 확인한다.
> 비밀값은 이 문서나 git 추적 파일에 저장하지 않는다.

---

## 현재 프로젝트 기준

| 항목 | 값 |
|---|---|
| GitHub repo | `pbcjimee-jimee/PBC-Quote-cal2026` |
| Git branch | `main` |
| Git remote | `git@github-pbc-quote-cal:pbcjimee-jimee/PBC-Quote-cal2026.git` |
| Git local email | `pbcjimee@gmail.com` |
| SSH alias | `github-pbc-quote-cal` |
| Vercel team | `jimee-s-projects` |
| Vercel project | `pbc-quote-cal2026-v2` |
| Vercel project ID | `prj_KMdOHSdwcmSxiypj1yvNqj4zM6Pp` |
| Supabase project ref | `ojcrfgguhbxhtlgdflzp` |
| Supabase CLI | repo-local devDependency, `supabase@2.108.0` |

---

## 빠른 확인

Windows에서는 PowerShell 실행 정책 때문에 `npm`/`vercel`의 `.ps1` shim이 막힐 수 있다.
이 프로젝트에서는 `cmd`와 `.cmd` 실행 파일을 기준으로 확인한다.

```cmd
scripts\check-cli-context.cmd
vercel.cmd whoami
git ls-remote origin main
```

정상 상태:

- Git remote가 `git@github-pbc-quote-cal:...`로 표시된다.
- `vercel.cmd whoami`가 `pbcjimee-4854`와 active team `jimee-s-projects (PBC)`를 보여준다.
- Supabase linked project-ref가 `ojcrfgguhbxhtlgdflzp`로 표시된다.
- `.env.local` 필수 키들은 `present`로 표시된다. 값은 출력하지 않는다.

---

## GitHub SSH

SSH key:

```txt
C:\Users\kjm12\.ssh\id_ed25519_pbc_quote_cal
```

SSH config:

```sshconfig
Host github-pbc-quote-cal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_pbc_quote_cal
  IdentitiesOnly yes
```

검증:

```cmd
ssh -T git@github-pbc-quote-cal
git ls-remote origin main
```

GitHub의 `ssh -T`는 shell access를 제공하지 않기 때문에 exit code가 1일 수 있다.
`Hi pbcjimee-jimee! You've successfully authenticated`가 보이면 인증은 성공이다.

---

## Vercel CLI

Vercel CLI는 전역 설치되어 있다.

```cmd
vercel.cmd --version
vercel.cmd whoami
vercel.cmd link --yes --scope jimee-s-projects --project pbc-quote-cal2026-v2
```

Vercel 환경 변수 변경, 도메인 변경, team/project 권한 변경은 위험 작업이다.
사용자 명시 승인 없이 실행하지 않는다.

---

## Supabase CLI

Supabase CLI는 프로젝트 devDependency로 고정한다.

```cmd
.\node_modules\.bin\supabase.cmd --version
.\node_modules\.bin\supabase.cmd projects list
```

로그인과 project link가 필요한 경우:

```cmd
scripts\supabase-login-link.cmd
```

스크립트가 묻는 값은 Supabase Personal Access Token이다.
반드시 `sbp_`로 시작해야 하며, `sb_publishable_...`, `sb_secret_...`, `eyJ...` 형식의 프로젝트 API key가 아니다.

토큰은 채팅, 문서, git 파일에 붙여넣지 않는다.

---

## Codex 앱

Codex 로컬 action은 `.codex/environments/environment.toml`에서 관리한다.
이 파일은 gitignore 대상이며 이 머신 전용 설정이다.

현재 Run action은 PowerShell 실행 정책 문제를 피하기 위해 다음 명령을 사용한다.

```cmd
npm.cmd run dev
```

CLI 상태 확인 action은 다음 스크립트를 호출한다.

```cmd
scripts\check-cli-context.cmd
```
