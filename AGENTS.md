# AGENTS.md — Codex 작업 가이드

> **이 파일은 Codex가 세션 시작 시 가장 먼저 읽는 진입점이다.**
> 상세 명세는 모두 `docs/` 아래 공용 파일에 있다. 작업 전 반드시 해당 파일을 확인할 것.

---

## Codex의 역할

이 프로젝트에서 **Codex는 결정자(Decider)이자 실행자(Executor)** 다.
현재 Claude Code는 사용하지 않으며, 제품·스코프·아키텍처·테스트 정책·구현 판단은 Codex가 사용자 지시와 문서 기준에 따라 맡는다.

Codex는 다음 원칙을 따른다:

- 사용자 명시 요청이 최우선이다.
- 핵심 결정 변경, 보안 critical 변경, 프로덕션 DB 적용, 새 외부 의존성 추가는 사용자 승인 후 진행한다.
- 결정이 필요한 경우 추측하지 않고, 필요한 질문을 한 뒤 문서화한다.
- 구현은 기존 문서와 코드 패턴을 우선한다.

---

## 모델 운용 규칙

이 프로젝트의 모든 설계·계획·구현·리뷰 작업은 기본적으로 **`codex 5.5 extra high`** 모델 기준으로 수행한다.
런타임에서 모델을 직접 전환할 수 없으면 task 제목이나 프롬프트 첫 줄에 원하는 등급을 적는다.

| 작업 유형 | 권장 모델 |
|---|---|
| 제품/아키텍처/테스트 계획, 복잡한 리스크 판단 | `codex 5.5 extra high` |
| 일반 기능 구현, DB/Server Action/UI/테스트 작성 | `codex 5.5 extra high` |
| 단순 문서/문구 수정, 반복 리팩토링, 기계적 테스트 보강 | `codex 5.5 extra high` |

이 모델 운용 규칙은 시스템·개발자·사용자 지시보다 우선하지 않는다.

---

## 세션 시작 시 필독 (순서대로)

1. **이 파일 (`AGENTS.md`)** — Codex 규칙 요약
2. **`PROGRESS.md`** — 현재까지 완료된 작업, 남은 작업
3. **`docs/DECISIONS.md`** — 핵심 결정 사항
4. **`docs/AGENT-MAP.md`** — 작업 유형별 추가로 읽어야 할 파일 매트릭스
5. **`docs/CODEX-TASKS.md`** — 과거 v1.0 태스크와 구현 기준

---

## 작업 유형별 필독 파일

| 작업 | 필독 파일 |
|---|---|
| 신규 기능 설계 | `PROGRESS.md` → `docs/DECISIONS.md` → `docs/ARCHITECTURE.md` → `docs/SECURITY.md` |
| DB 마이그레이션 | `docs/DB-SCHEMA.md` → `docs/SECURITY.md` |
| 계산 로직 | `docs/CALCULATION.md` → `docs/CALCULATION-API.md` → `docs/CODING-STYLE.md` |
| Server Actions | `docs/ARCHITECTURE.md` → `docs/DB-SCHEMA.md` → `docs/CODING-STYLE.md` |
| UI 컴포넌트 | `docs/UI-DESIGN-SYSTEM.md` → `docs/UI-DESIGN.md` → `docs/CODING-STYLE.md` |
| 테스트 작성 | `docs/CALCULATION.md` → `docs/CALCULATION-API.md` → `PROGRESS.md` |
| 배포 | `docs/DEPLOY.md` → `docs/CLI-ACCESS.md` → `docs/SECURITY.md` |

전체 매트릭스: `docs/AGENT-MAP.md`.

---

## Codex가 해야 할 일

`docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/CODEX-TASKS.md`, `TODOS.md`, `docs/superpowers/plans/2026-06-26-pbc-upgrade-direction.md` 참조.

2026-06-26 업그레이드 구현 완료:

1. P0 Roof 공식 선택값 영속화 (`quotes.roof_selected_min`, `quotes.roof_selected_max`)
2. Quote detail Roof 표시 보강 (`interior | exterior | roof`)
3. Local draft privacy/expiry (민감 Jobber fetch 결과 저장 방지, 7일 만료, clear local drafts)
4. Jobber sync preview/retry
5. 과거 견적 duplicate (Jobber quote id 미복사, material 가격은 현재 소비자가 기준)

백업 운영: 코드/마이그레이션 변경 이력은 Git으로 보존한다.

이번 업그레이드 제외: `ADMIN_EMAILS` 기반 관리자 gate, 별도 role split, material 실제 원가/RRP 분리, 추가 가격작성 정보 패널, 공식/GST 변경.

---

## Codex가 임의로 하지 말아야 할 일

- ❌ 사용자 승인 없이 프로덕션 DB 마이그레이션 적용
- ❌ 사용자 승인 없이 Vercel 환경 변수·도메인 변경
- ❌ 사용자 승인 없이 사용자 데이터 영구 삭제
- ❌ 사용자 승인 없이 `git push --force`, `git reset --hard`
- ❌ 사용자 승인 없이 새 외부 의존성 추가
- ❌ 사용자 승인 없이 `TODOS.md` 항목 추가/제거
- ❌ 사용자 승인 없이 `docs/DECISIONS.md`의 핵심 결정 변경

의문이 들면 사용자에게 확인하고, 확인된 결정은 관련 문서에 반영한다.

---

## 핵심 결정 사항

모두 `docs/DECISIONS.md`에 있다. 요약:

- v1.0 범위: Auth + 페인트 DB + 5가지 공식 계산기 + 견적 저장·검색 + Settings + 배포
- 5가지 공식: `docs/CALCULATION.md` (하드코딩 금지, `pricing_settings`에서 가져옴)
- Subtotal: 사용자가 min·max 수동 선택, `(min + max) / 2`
- 금액: **`decimal.js` 필수**, native number 금지
- 가격 스냅샷: `quote_items`·`quotes`에 모두 저장
- RLS: 모든 테이블 활성화, 인증 사용자만 접근
- 에러 패턴: `{ ok: true, data } | { ok: false, error }`

Codex는 사용자 승인 없이 이 결정을 임의로 바꾸지 않는다.

---

## 코딩 스타일

전체 규칙: `docs/CODING-STYLE.md`. 요약:

- TypeScript strict, `any` 금지 (`unknown` 사용)
- 함수형 컴포넌트, Server Components 기본
- 명명: 파일 kebab-case, 컴포넌트 PascalCase, 함수 camelCase
- 금액 처리: `decimal.js` 사용, UI 표시 직전에만 `.toFixed(2)`
- Server Actions: Zod 검증 + `Result<T>` 패턴
- 주석: 기본 없음, "왜"가 비자명할 때만

---

## 보안 규칙

전체 규칙: `docs/SECURITY.md`. 요약:

- `.env*` commit 금지, `.env.example`만
- `SUPABASE_SERVICE_ROLE_KEY`는 Server Actions에서만
- `actual_price` 로그 출력 금지
- `dangerouslySetInnerHTML` 금지
- Raw SQL 회피 (Supabase 클라이언트 사용)

### 위험 작업 (사용자 명시 승인 필요)

- 프로덕션 DB 마이그레이션 적용
- Vercel 환경 변수·도메인 변경
- 사용자 데이터 영구 삭제
- `git push --force`, `git reset --hard`
- 새 외부 의존성 추가

---

## 작업 형식

Codex는 다음 형식으로 task를 정리한다:

```md
[태스크 #X] {짧은 제목}

**Input docs to read first:**
- (관련 docs/ 파일들)

**Task:**
{좁고 명확한 작업 정의}

**Out of scope:**
{이번에 안 할 것 명시}

**Acceptance criteria:**
- TypeScript 컴파일 통과
- ESLint 통과
- (기타 검증 가능한 조건)

**When done:**
변경 파일 목록과 변경 요약을 보고
```

모호한 요청이 오면 명확화 질문부터 한다.

---

## 완료 보고 형식

```md
✅ [태스크 #X] {제목} 완료

**Changed files:**
- {path}: {변경 요약}

**New tests:**
- {test file}: {테스트 수}

**Acceptance criteria check:**
- [✅/❌] TypeScript 컴파일 통과
- [✅/❌] ESLint 통과
- [✅/❌] 테스트 통과 ({N}/{M})

**Notes / questions:**
{있으면 — 의문점, 다음 단계 제안}
```

---

## 충돌·의문 처리

| 상황 | 행동 |
|---|---|
| 명세가 모호함 | 명확화 질문, 추측 금지 |
| 명세와 기존 코드가 모순 | 사용자에게 알리고 진실 확인 |
| 더 좋은 방법이 보임 | 이유와 트레이드오프를 제안하고 사용자 확인 후 진행 |
| 같은 문제로 3회 시도 실패 | 중단, `gstack-investigate` 권장 |
| 보안 critical 변경 | 사용자 확인 필수 (`docs/SECURITY.md`) |
| 스코프 확장 필요 | 사용자 확인 후 문서화하고 진행 |

---

> 문서 변경 이력은 `PROGRESS.md` 참조.
