# WORKFLOW-TASKS.md — Codex 상세 작업 목록

> Codex의 phase별 작업·작업 프롬프트 템플릿.
> 작업 원칙과 역할 기준: `docs/WORKFLOW.md`.

---

## Codex 작업 (Phase별)

### Phase 1: 설계

| 작업 | 사용 스킬 | 산출물 |
|---|---|---|
| 문제 정의 + 요구사항 명확화 | `superpowers:brainstorming` 또는 일반 질의 | 설계 요약 또는 design doc |
| 아키텍처·테스트 설계 | `superpowers:writing-plans`, 필요 시 review 계열 | design doc + test plan |
| 계산 공식 명세 변경 | 일반 + 테스트 우선 접근 | `docs/CALCULATION.md`, `docs/CALCULATION-API.md` |
| 시스템 아키텍처 명세 | 일반 | `docs/ARCHITECTURE.md`, `docs/DB-SCHEMA.md` |
| 워크플로우 갱신 | 일반 | `docs/WORKFLOW.md`, `docs/AGENT-MAP.md` |

### Phase 2: 구현 전 추가 검증

| 작업 | 사용 스킬 | 시점 |
|---|---|---|
| UI/UX 디자인 시스템 확인 | `design-consultation` 또는 관련 디자인 스킬 | UI 코딩 시작 전 |
| UI 계획 리뷰 | `plan-design-review` | 복잡한 UI 변경 전 |
| 보안 검토 | `codex-security:*` 또는 `security-scan` | DB/RLS/OAuth/민감 데이터 변경 전 |
| 복잡한 리스크 판단 | `superpowers:brainstorming`, `superpowers:writing-plans` | 범위가 큰 기능 전 |

### Phase 3: 구현

| 작업 | 입력 | 출력 |
|---|---|---|
| DB 마이그레이션 SQL 작성 | `docs/DB-SCHEMA.md`, `docs/SECURITY.md` | `supabase/migrations/*.sql` |
| 계산 로직 구현 | `docs/CALCULATION.md`, `docs/CALCULATION-API.md` | 순수 함수 + 타입 정의 |
| Supabase 클라이언트/Server Action 구현 | `docs/ARCHITECTURE.md`, `docs/CODING-STYLE.md` | `lib/actions/*.ts`, `lib/supabase/*.ts` |
| Route Handler 구현 | API 연동 명세, 보안 기준 | `app/api/**/route.ts` |
| UI 컴포넌트 구현 | `docs/UI-DESIGN-SYSTEM.md`, 페이지별 명세 | `components/**/*.tsx`, `app/**/*.tsx` |
| 파일 생성/다운로드 구현 | 템플릿 명세, 보안 기준 | 서버/클라이언트 다운로드 흐름 |
| 단위 테스트 작성 | test plan | `tests/*.test.ts` |
| 버그 수정 | 버그 리포트 + 재현 단계 | 수정 diff + 회귀 테스트 |
| 리팩토링 | 명확한 목표 | 동일 동작·더 나은 구조 |

### Phase 4: 구현 후 검증

| 작업 | 사용 스킬/명령 | 시점 |
|---|---|---|
| 코드 리뷰 | 자체 diff review, 필요 시 `review` 또는 `gstack-review` | 변경 완료 후 |
| 보안 검토 | 관련 security skill 또는 수동 체크 | DB/RLS/OAuth/민감 데이터 변경 시 |
| QA 테스트 | `gstack-qa`, `qa`, 브라우저 smoke | 사용자 흐름 변경 시 |
| 완료 전 검증 | `superpowers:verification-before-completion` | 완료 보고 전 |
| 문서 업데이트 | 일반 | 사용자·운영 기준 변경 시 |

---

## Codex가 임의로 하지 말아야 할 일

- ❌ 사용자 승인 없이 프로덕션 DB 마이그레이션 적용
- ❌ 사용자 승인 없이 Vercel 환경 변수·도메인 변경
- ❌ 사용자 승인 없이 사용자 데이터 영구 삭제
- ❌ 사용자 승인 없이 `git push --force`, `git reset --hard`
- ❌ 사용자 승인 없이 새 외부 의존성 추가
- ❌ 사용자 승인 없이 `TODOS.md` 항목 추가/제거
- ❌ 사용자 승인 없이 `docs/DECISIONS.md` 핵심 결정 변경

---

## 모델 기준

모든 작업은 기본적으로 `codex 5.5 extra high` 모델 기준으로 수행한다.
런타임에서 모델 전환이 불가능하면 프롬프트 첫 줄에 다음과 같이 표시한다.

```text
Model: codex 5.5 extra high
```

---

## Codex 작업 프롬프트 템플릿

```md
[작업 #X] {짧은 제목}

**Model:**
codex 5.5 extra high

**Input docs to read first:**
- docs/ARCHITECTURE.md
- docs/CALCULATION.md
- 관련된 다른 파일들

**Task:**
{명확하고 좁은 작업 정의}

**Out of scope:**
{이번에 하지 말 것 명시}

**Acceptance criteria:**
- TypeScript 컴파일 통과
- ESLint 통과
- 관련 테스트 통과
- {기타 검증 가능한 조건}

**When done:**
변경된 파일 목록과 변경 요약을 보고한다.
```

---

## 컨텍스트 공유 방법

| 정보 | 어디에 저장 |
|---|---|
| 프로젝트 핵심 결정 | `docs/DECISIONS.md` |
| 작업 진행과 변경 이력 | `PROGRESS.md` |
| 작업 기준과 역할 | `AGENTS.md`, `docs/WORKFLOW.md`, `docs/AGENT-MAP.md` |
| 구현 계획 | `docs/superpowers/plans/` |
| 설계 문서 | `docs/superpowers/specs/` |
| 작업 이력 | git commit messages |

**원칙:** 다음 세션에도 유효해야 하는 결정은 대화에만 남기지 말고 `docs/` 또는 `PROGRESS.md`에 반영한다.
