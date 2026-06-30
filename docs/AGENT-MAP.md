# AGENT-MAP.md — Codex 필독 파일 매트릭스

> Codex가 세션 시작·작업 시 참조해야 할 파일 매핑.
> 현재 프로젝트는 Claude Code를 사용하지 않으며, Codex가 결정·설계·구현·검증을 모두 담당한다.

---

## 진입점 (Entry Point)

| Agent | 진입 파일 | 역할 |
|---|---|---|
| **Codex** | `AGENTS.md` | 결정자 + 실행자 — 설계·아키텍처·UI/UX·DB·구현·테스트·리뷰·배포 |
| **Claude Code** | `CLAUDE.md` | Deprecated — 현재 운영에서 사용하지 않음 |

---

## 모델 라우팅

작업 지시·스킬 호출·하위 에이전트 핸드오프 시 모델 등급을 함께 적는다.

| 작업 유형 | 권장 모델 |
|---|---|
| 계획, 아키텍처, 테스트 전략, 복잡한 리스크 판단 | `codex 5.5 extra high` |
| 일반 코드 구현, DB/Server Action/UI/test 작성 | `codex 5.5 extra high` |
| 단순 수정, 반복 작업, 기계적 문서/테스트 보강 | `codex 5.5 extra high` |

런타임에서 모델 전환이 불가능하면 프롬프트 첫 줄에 원하는 등급을 표시한다.

---

## 공용 파일

### 진행·결정·규칙

| 파일 | 용도 | 갱신 빈도 |
|---|---|---|
| `PROGRESS.md` | 현재 진행 현황 + 전체 변경 이력 | **매 작업 후** |
| `docs/DECISIONS.md` | 핵심 결정사항 | 사용자 승인으로 결정 변경 시 |
| `docs/CODING-STYLE.md` | TypeScript·명명·금액·에러 패턴 | 거의 없음 |
| `docs/SECURITY.md` | 보안 규칙·위험 작업 승인 정책 | 보안 정책 변경 시 |
| `docs/DEPLOY.md` | Vercel 배포 설정 | 환경 변경 시 |
| `docs/CLI-ACCESS.md` | 프로젝트별 GitHub/Vercel/Supabase CLI 접근 기준 | 계정·remote·CLI 변경 시 |
| `TODOS.md` | v1.1+ 작업 목록 | 사용자 승인 후 |

### 아키텍처

| 파일 | 용도 |
|---|---|
| `docs/ARCHITECTURE.md` | 시스템 구조·데이터 흐름·성능 |
| `docs/DB-SCHEMA.md` | DB 테이블·인덱스·RLS DDL |

### 계산

| 파일 | 용도 |
|---|---|
| `docs/CALCULATION.md` | 5가지 공식 명세·검증·정밀도 |
| `docs/CALCULATION-API.md` | TypeScript API 시그니처·fixture |

### UI

Latest visual styling source of truth: `docs/UI-DESIGN-SYSTEM.md`.
Older UI files remain useful for page behavior and historical context, but
shared tokens, component classes, radius, shadow, and responsive rules come
from `docs/UI-DESIGN-SYSTEM.md`.

| 파일 | 용도 |
|---|---|
| `docs/UI-DESIGN-SYSTEM.md` | 최신 공통 디자인 토큰·컴포넌트 규칙 |
| `docs/UI-DESIGN.md` | UI 개요·페이지 목록·디자인 토큰·구현 순서 |
| `docs/UI-QUOTE-FORM.md` | `/quotes/new` 상세 |
| `docs/UI-PAGES.md` | 로그인·목록·상세·설정 페이지 |
| `docs/UI-UX-REVIEW.md` | v1.0 UI/UX 정적 리뷰·접근성·시각 위계·quick win 개선안 |

### 워크플로우

| 파일 | 용도 |
|---|---|
| `docs/WORKFLOW.md` | Codex 중심 작업 원칙·흐름 |
| `docs/WORKFLOW-TASKS.md` | Phase별 작업·Codex 프롬프트 템플릿 |
| `docs/superpowers/specs/2026-05-19-jobber-write-back-design.md` | Jobber controlled write-back 결정 변경 설계 |
| `docs/superpowers/plans/2026-05-19-jobber-write-back.md` | Jobber controlled write-back 구현 순서 |
| `docs/superpowers/specs/2026-05-27-quote-workspace-area-subtotals-design.md` | Quote workspace, Interior/Exterior grouped subtotal, option subtotal display, sidebar collapse design |
| `docs/superpowers/plans/2026-05-27-quote-workspace-area-subtotals.md` | Quote workspace grouped subtotal implementation plan |
| `docs/superpowers/plans/2026-06-26-pbc-upgrade-direction.md` | Revised upgrade direction: Roof persistence, local draft privacy, Jobber sync preview/retry, duplicate quote, backup |

---

## Deprecated 파일

| 파일 | 상태 |
|---|---|
| `CLAUDE.md` | 현재 운영에서 사용하지 않음. 과거 Claude Code 기준 문서였으며, 최신 기준은 `AGENTS.md`와 `docs/WORKFLOW.md`다. |
| `C:\Users\kjm12\.claude\projects\.../memory/` | 현재 운영에서 사용하지 않음. |

---

## 작업별 필독 파일 매트릭스

| 작업 유형 | 필독 파일 |
|---|---|
| **신규 기능 설계** | `AGENTS.md` → `PROGRESS.md` → `docs/DECISIONS.md` → `docs/ARCHITECTURE.md` → `docs/SECURITY.md` |
| **DB 마이그레이션** | `AGENTS.md` → `docs/DB-SCHEMA.md` → `docs/SECURITY.md` |
| **계산 로직** | `AGENTS.md` → `docs/CALCULATION.md` → `docs/CALCULATION-API.md` → `docs/CODING-STYLE.md` |
| **Server Actions** | `AGENTS.md` → `docs/ARCHITECTURE.md` → `docs/DB-SCHEMA.md` → `docs/CODING-STYLE.md` |
| **UI 컴포넌트** | `AGENTS.md` → `docs/UI-DESIGN-SYSTEM.md` → `docs/UI-DESIGN.md` → (페이지별: `UI-QUOTE-FORM.md` 또는 `UI-PAGES.md`) → `docs/UI-UX-REVIEW.md` → `docs/CODING-STYLE.md` |
| **테스트 작성** | `AGENTS.md` → `docs/CALCULATION.md` → `docs/CALCULATION-API.md` → `PROGRESS.md` |
| **코드 리뷰** | `AGENTS.md` → `docs/DECISIONS.md` → `docs/CODING-STYLE.md` → `docs/SECURITY.md` |
| **배포** | `AGENTS.md` → `docs/DEPLOY.md` → `docs/CLI-ACCESS.md` → `docs/SECURITY.md` |

---

## 충돌·불일치 발생 시

1. 같은 정보가 두 파일에 다르게 적혀 있으면 `docs/DECISIONS.md`를 우선한다.
2. 최신 사용자 명시 지시가 있으면 사용자 지시를 우선하고 관련 문서를 갱신한다.
3. 정보 중복 발견 시 공용 문서로 이동하고 진입 파일에는 링크만 남긴다.

---

> 문서 변경 이력은 `PROGRESS.md` 참조.
