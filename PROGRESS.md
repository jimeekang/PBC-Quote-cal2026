# PROGRESS.md — PBC 견적 계산기 진행 현황

> **이 파일은 Claude Code와 Codex 모두 읽는 공용 진행 현황 문서다.**
> 새 세션 시작 시 이 파일을 먼저 읽고 "이미 된 것"과 "남은 것"을 파악한다.

---

## 프로젝트 기본 정보

| 항목 | 내용 |
|---|---|
| **앱** | PBC 견적 계산기 — 페인팅 회사 PBC 사내 도구 |
| **스택** | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Supabase + Vercel |
| **현재 버전** | v1.0 구현 진행 중 |
| **배포 URL** | https://pbc-quote-cal2026-kjm12081-3858s-projects.vercel.app |
| **GitHub Repo** | jimeekang/PBC-Quote-cal2026 (branch: main) |

---

## v1.0 전체 진행 현황

```
[██████████░░░░░░░░░░] 50% — 스캐폴드·DB·계산기 완료 / UI·Actions 미구현
```

---

## ✅ 완료된 작업

### 인프라 & 셋업 (2026-05-12)

- [x] Next.js 16.2.6 + React 19.2.4 + TypeScript + Tailwind CSS 4 앱 스캐폴드
- [x] `package.json` 스크립트: `dev`, `build`, `start`, `lint`, `test`, `test:run`, `test:coverage`, `typecheck`
- [x] 핵심 의존성 설치: `decimal.js`, `zod`, `@supabase/supabase-js`, `@supabase/ssr`, `vitest`, `@vitest/coverage-v8`
- [x] Vercel 배포 설정 (`vercel.json`, 프로젝트 연결, main 브랜치 push 자동 배포)
- [x] `.env.example` 작성, `.env.local` gitignore 등록

### DB 마이그레이션 (2026-05-12)

- [x] `supabase/migrations/0001_initial_schema.sql` — `products`, `pricing_settings`, `quotes`, `quote_items` 테이블 + 인덱스
- [x] `supabase/migrations/0002_rls_policies.sql` — 4개 테이블 RLS 활성화, 인증 사용자 공통 권한 정책

### 계산 로직 (2026-05-13)

- [x] `lib/calculator.ts` — `decimal.js` 기반 5가지 공식, subtotal, final total, 입력 검증, `DEFAULT_PRICING_SETTINGS`
- [x] `tests/calculator.test.ts` — 22개 단위 테스트 (공식, Decimal 입력, 반일 작업, 0 자재비, 음수 입력, subtotal/final)
- [x] `tests/fixtures/historical-quotes.ts` — 회귀 fixture 구조 + 샘플 1건 (⚠️ 실제 PBC 과거 견적 3건으로 교체 필요)

### Supabase 클라이언트 (2026-05-13)

- [x] `lib/supabase/client.ts` — 브라우저용 anon client
- [x] `lib/supabase/server.ts` — 서버용 client + service role client helper
- [x] `lib/supabase/middleware.ts` — 세션 갱신 helper
- [x] `lib/supabase/types.ts` — 수동 Database 타입 (추후 generated types로 교체 예정)

### 라우팅 & 유틸리티 (2026-05-13)

- [x] `proxy.ts` — Next.js 16 Proxy Runtime 호환 라우팅 게이트 (Supabase auth cookie 기반 `/login` ↔ `/quotes` 리다이렉트)
- [x] `lib/validators.ts` — quote, pricing settings, product search용 Zod 스키마 초안
- [x] `lib/utils.ts` — `cn`, CAD 통화 포맷, Decimal 기반 숫자 포맷 helper
- [x] `app/page.tsx` — 루트 → `/login` redirect
- [x] `app/(auth)/login/page.tsx` — 로그인 placeholder UI
- [x] `app/(app)/quotes/page.tsx` — 견적 목록 placeholder UI

---

## 🔲 남은 작업 (v1.0)

### 인증

- [ ] 로그인 Server Action 또는 client submit (Supabase Auth email/password)
- [ ] 로그아웃 처리

### 견적 핵심 플로우

- [ ] `/quotes/new` 페이지 라우트
- [ ] QuoteForm 컴포넌트 (작업일수 입력, 페인트 검색, 출장비, 기타비)
- [ ] 페인트 검색 UI (제품명 검색 → market/actual price 자동입력)
- [ ] 공식 결과 UI (5가지 공식 실시간 표시)
- [ ] 최종가 summary (min·max 수동 선택 → subtotal → final total)

### Server Actions

- [ ] `lib/actions/quotes.ts` — `createQuote`, `updateQuote`, `getQuote`, `listQuotes`
- [ ] `lib/actions/products.ts` — `searchProducts`, `importProductsFromCSV`
- [ ] `lib/actions/settings.ts` — `getPricingSettings`, `updatePricingSettings`

### 견적 관리

- [ ] 견적 목록 실제 구현 (Supabase 조회, 검색/필터)
- [ ] 견적 상세 페이지 (`/quotes/[id]`)
- [ ] 견적 수정 플로우

### Settings

- [ ] `/settings` 페이지 — pricing settings (일당, 마진율) 수정 UI

### 제품 관리

- [ ] CSV import 로직 + 제품 목록 화면

### 테스트

- [ ] `tests/rls.test.ts` — RLS 정책 자동 검증 (사용자 격리·미인증 거부)
- [ ] Server Actions 단위 테스트 (80%+ 커버리지)
- [ ] `tests/fixtures/historical-quotes.ts` — 실제 PBC 과거 견적 3건으로 교체

---

## 🚫 v1.0 스코프 밖 (v1.1+)

- Jobber GraphQL API OAuth 연동
- 견적 복제(Duplicate) 기능
- 페인트 DB 관리 UI (`/products` CRUD)
- 자동 DB 백업 (v1.0 출시 직후 1주 내 처리)

---

## 변경 이력

> 모든 문서 파일의 변경 이력은 이 표로 통합 관리한다. 개별 md 파일에는 변경 이력 섹션을 두지 않는다.

| 날짜 | 작업 | 담당 |
|---|---|---|
| 2026-05-12 | 초안 설계: office-hours + plan-eng-review 세션. 핵심 결정 박제 | Claude Code |
| 2026-05-12 | `docs/ARCHITECTURE.md` 초안 (시스템 구조·DB 스키마·RLS·환경 변수) | Claude Code |
| 2026-05-12 | `docs/CALCULATION.md` 초안 (5가지 공식·검증 규칙·정밀도·fixture 정의) | Claude Code |
| 2026-05-12 | `docs/WORKFLOW.md` 초안 (Claude/Codex 역할 분담 정의) | Claude Code |
| 2026-05-12 | `CLAUDE.md` 초안 (Claude=결정자, Codex=실행자) | Claude Code |
| 2026-05-12 | `AGENTS.md` 초안 (Codex 역할·금지 사항·완료 보고 형식) | Claude Code |
| 2026-05-12 | Next.js 16 앱 스캐폴드, `.env.example`, `vercel.json`, Vercel 배포 설정 완료 | Codex |
| 2026-05-12 | Supabase DB 마이그레이션 (`0001_initial_schema.sql`, `0002_rls_policies.sql`) | Codex |
| 2026-05-13 | `lib/calculator.ts` 구현 (decimal.js 기반 5가지 공식 + 검증) | Codex |
| 2026-05-13 | `tests/calculator.test.ts` 22개 단위 테스트 작성 | Codex |
| 2026-05-13 | Supabase 클라이언트 (`client.ts`, `server.ts`, `middleware.ts`, `types.ts`) | Codex |
| 2026-05-13 | `proxy.ts` Next.js 16 Proxy Runtime 라우팅 게이트 | Codex |
| 2026-05-13 | `lib/validators.ts`, `lib/utils.ts`, placeholder 페이지들 | Codex |
| 2026-05-13 | `docs/UI-DESIGN.md` 초안 (plan-design-review 세션 산출물, 8개 페이지·30+ 컴포넌트 명세) | Claude Code |
| 2026-05-13 | PROGRESS.md, CODEX.md 생성. AGENTS.md Vercel 배포 섹션 추가. CLAUDE.md 정리 | Claude Code |
| 2026-05-13 | 문서 재구성 1차: CLAUDE.md·AGENTS.md 중복 제거, 공용 docs 분리 (`AGENT-MAP`, `DECISIONS`, `CODING-STYLE`, `SECURITY`, `DEPLOY`, `CODEX-TASKS`). 모든 진입 파일 200줄 이하. CODEX.md 삭제 (AGENTS.md + docs/CODEX-TASKS.md로 통합) | Claude Code |
| 2026-05-13 | 문서 재구성 2차: 200줄 초과 4개 파일 분할 — `ARCHITECTURE.md` → `DB-SCHEMA.md` 분리, `UI-DESIGN.md` → `UI-QUOTE-FORM.md` + `UI-PAGES.md` 분리, `CALCULATION.md` → `CALCULATION-API.md` 분리, `WORKFLOW.md` → `WORKFLOW-TASKS.md` 분리. 모든 md 파일 200줄 이하 달성. 개별 파일의 "변경 이력" 섹션을 모두 제거하고 PROGRESS.md로 통합 | Claude Code |
