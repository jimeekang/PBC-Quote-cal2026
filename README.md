# PBC Quote Calculator

페인팅 회사 PBC의 사내 견적 자동화 웹앱.

Excel 2개 + Jobber를 오가던 견적 작업을 **한 페이지**에서 끝낸다. 페인트 자재 검색, 5가지 견적 공식 동시 계산, min/max 선택, 견적 저장·검색, Jobber quote fetch/write-back까지 포함한다.

**상태:** v1.0 핵심 플로우 완료 (Auth · 견적 생성·수정·삭제 · 옵션 견적 · app-only internal memos · Jobber fetch/write-back · QA/RLS 검증 완료).

**2026-06-26 보완 완료:** Roof 공식 선택값 저장, local draft 민감 fetch 결과 저장 방지/7일 만료, Jobber sync preview/retry, 과거 견적 duplicate 구현 완료. Supabase 실제 데이터 백업은 운영 결정 대기 상태로 남겨둔다. 별도 `/products` 관리 페이지는 현재 필요 없고 Settings의 Paint Product 및 Product & Service 관리로 충분하다.

CRUD 화면은 운영량이 Settings 범위를 넘을 때만 재검토한다. `ADMIN_EMAILS` 기반 권한 분리, material 실제 원가/RRP 분리, 추가 가격작성 정보 패널은 제외한다.

---

## 빠른 시작

Windows `cmd` 기준:

```cmd
# 환경 변수 셋업
copy .env.example .env.local
# .env.local 값 채우기

# 의존성 설치 및 실행
npm.cmd install
npm.cmd run dev

# 테스트
npm.cmd run test:run
```

CLI 계정 상태 확인:

```cmd
scripts\check-cli-context.cmd
vercel.cmd whoami
git ls-remote origin main
```

프로젝트별 GitHub/Vercel/Supabase 접근 기준은 [docs/CLI-ACCESS.md](./docs/CLI-ACCESS.md)를 따른다.

---

## 문서

이 프로젝트는 현재 **Codex 중심**으로 개발한다. 모든 결정·명세는 문서로 남기고, 문서를 source of truth로 사용한다.

| 문서 | 내용 |
|---|---|
| **[AGENTS.md](./AGENTS.md)** | Codex 작업 가이드. 역할, 모델 기준, 코딩 스타일, 금지 사항 |
| **[CLAUDE.md](./CLAUDE.md)** | Deprecated. 현재 Claude Code는 사용하지 않음 |
| **[PROGRESS.md](./PROGRESS.md)** | 현재 진행 상태, 완료/차단 항목, 전체 변경 이력 |
| **[docs/AGENT-MAP.md](./docs/AGENT-MAP.md)** | 작업 유형별 필독 문서 매트릭스 |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | 시스템 구조, DB 스키마, RLS 정책, 환경 변수 |
| **[docs/CALCULATION.md](./docs/CALCULATION.md)** | 5가지 견적 공식 명세, 정밀도 규칙, 검증 |
| **[docs/CLI-ACCESS.md](./docs/CLI-ACCESS.md)** | 프로젝트별 GitHub SSH, Vercel CLI, Supabase CLI 접근 기준 |
| **[docs/UI-UX-REVIEW.md](./docs/UI-UX-REVIEW.md)** | v1.0 UI/UX 정적 리뷰, 접근성·시각 위계·quick win 개선안 |
| **[docs/WORKFLOW.md](./docs/WORKFLOW.md)** | Codex 중심 작업 흐름, 충돌 처리 |
| **[TODOS.md](./TODOS.md)** | v1.1+ 작업 목록 |
| **[docs/superpowers/specs/2026-05-27-quote-workspace-area-subtotals-design.md](./docs/superpowers/specs/2026-05-27-quote-workspace-area-subtotals-design.md)** | Quote workspace, Interior/Exterior grouped subtotal, option subtotal display design |
| **[docs/superpowers/plans/2026-05-27-quote-workspace-area-subtotals.md](./docs/superpowers/plans/2026-05-27-quote-workspace-area-subtotals.md)** | Implementation plan for the quote workspace and grouped subtotal update |
| **[docs/superpowers/plans/2026-06-26-pbc-upgrade-direction.md](./docs/superpowers/plans/2026-06-26-pbc-upgrade-direction.md)** | Revised upgrade direction after user scope changes |

---

## 개발 워크플로우

- **담당:** Codex가 결정자이자 실행자다.
- **모델 기준:** 모든 주요 작업은 `codex 5.5 extra high` 기준으로 수행한다.
- **설계:** 새 기능은 요구사항 확인 → 설계 요약/design doc → 구현 계획 → 구현 순서로 진행한다.
- **검증:** 변경 후 typecheck, lint, 관련 테스트를 실행한다.
- **승인 필요:** 프로덕션 DB 적용, Vercel 환경 변수·도메인 변경, 사용자 데이터 영구 삭제, force push/reset, 새 외부 의존성 추가.

자세한 내용은 [docs/WORKFLOW.md](./docs/WORKFLOW.md).

---

## 기술 스택

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Next.js Server Actions + Supabase (Postgres + Auth)
- **외부 연동:** Jobber GraphQL API (OAuth 2.0, quote fetch + controlled Product / Service line item write-back)
- **금액 계산:** decimal.js (부동소수점 오차 회피), 최종가는 GST 10% 가산
- **검증:** Zod
- **테스트:** Vitest (단위), Playwright (E2E, 추후)
- **배포:** Vercel

자세한 내용은 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 단계별 출시 계획

| 버전 | 범위 | 상태 |
|---|---|---|
| v1.0 | Auth, 페인트 DB, 5가지 공식 계산기, 견적 CRUD, Interior/Exterior/Roof 작업 영역, 옵션 견적, Settings, Jobber fetch/write-back | 핵심 플로우·QA·RLS 검증 완료 |
| v1.1 | Roof 공식 선택값 저장, local draft 보안, Jobber sync preview/retry, 과거 견적 복제 기능 | 구현/검증 완료 |
| Ops | 백업 운영 결정: Supabase Pro/PITR 우선, cron backup은 restore 검증 포함 시만 선택 | 사용자 결정 대기 |
| v1.5 | Settings 운영량 확인 후 필요할 때만 독립 `/products` 관리 페이지 재검토, Supabase 실제 데이터 백업 정책 결정 | TODOS #2, #3 |
| v2 | 자동 견적가 추산 (ML), 분석 대시보드 | 데이터 쌓인 후 |

---

## 보안 모델 (요약)

- Supabase Auth (이메일/비밀번호 + Magic Link)
- 모든 테이블 **RLS 켜기**. v1.0은 모든 인증 사용자 동일 권한.
- `actual_price`는 내부 가격 스냅샷 필드로 취급하며 인증 사용자만 접근하고 로그에 남기지 않음.
- API 키는 `.env.local` (gitignore), `service_role_key`는 Server Actions 전용.
- 자세한 내용은 [docs/SECURITY.md](./docs/SECURITY.md).

---

## 라이선스

Private. 사내 도구이므로 외부 공개·배포 안 함.
