# WORKFLOW-TASKS.md — Claude·Codex 상세 작업 목록

> 두 도구의 phase별 작업·Codex 작업 프롬프트 템플릿.
> 협업 원칙·역할 분담: `docs/WORKFLOW.md`.

---

## Claude Code 작업 (Phase별)

### Phase 1: 설계 (이미 완료 ✅)

| 작업 | 사용 스킬 | 산출물 |
|---|---|---|
| 문제 정의 + 요구사항 명확화 | `gstack-office-hours` | `~/.gstack/projects/pbc-quote-cal/*-design-*.md` |
| 아키텍처·테스트 설계 | `gstack-plan-eng-review` | design doc + test plan + TODOS.md |
| 계산 공식 명세 | 일반 | `docs/CALCULATION.md` |
| 시스템 아키텍처 명세 | 일반 | `docs/ARCHITECTURE.md`, `docs/DB-SCHEMA.md` |
| 협업 워크플로우 | 일반 | `docs/WORKFLOW.md` |

### Phase 2: 구현 전 추가 검증 (선택)

| 작업 | 사용 스킬 | 시점 |
|---|---|---|
| UI/UX 디자인 시스템 정의 | `gstack-design-consultation` | UI 코딩 시작 전 |
| UI 플랜 디자인 리뷰 | `gstack-plan-design-review` | ASCII mockup → 실제 화면 변환 전 |
| 디자인 변형 비교 | `gstack-design-shotgun` | 시각적 아이덴티티 결정 시 |

### Phase 3: 구현 후 검증 (필수)

| 작업 | 사용 스킬 | 시점 |
|---|---|---|
| 코드 리뷰 (diff 기반) | `gstack-review` 또는 `review` | Codex 구현 후 매 PR |
| 보안 검토 | `security-review` | DB 마이그레이션·RLS·OAuth 변경 시 |
| QA 테스트 | `gstack-qa` 또는 `qa` | v1.0 출시 직전 |
| 디자인 폴리시 | `gstack-design-review` | UI 완성 후 |
| 헬스 체크 | `gstack-health` | 주 1회 |
| 디버깅 | `superpowers:systematic-debugging` | 복잡한 버그 발생 시 |

### Phase 4: 출시·유지보수

| 작업 | 사용 스킬 |
|---|---|
| PR 생성 + 배포 | `gstack-ship` + `gstack-land-and-deploy` |
| 출시 후 모니터링 | `gstack-canary` |
| 문서 업데이트 | `gstack-document-release` |
| 회고 | `gstack-retro` |

### 사용 빈도 높은 superpowers 스킬

- `superpowers:brainstorming` — 새 기능 설계 전
- `superpowers:test-driven-development` — 핵심 로직 작성 시 (calculator.ts)
- `superpowers:writing-plans` — 멀티 스텝 작업 시작 전
- `superpowers:verification-before-completion` — "끝났어"라고 말하기 전
- `superpowers:requesting-code-review` — Codex가 만든 코드 검증 전

---

## Codex 작업 목록

### Codex가 할 일

| 작업 | 입력 | 출력 |
|---|---|---|
| 1. DB 마이그레이션 SQL 작성 | `docs/DB-SCHEMA.md`의 DDL | `supabase/migrations/0001_*.sql`, `0002_*.sql` |
| 2. `lib/calculator.ts` 구현 | `docs/CALCULATION.md` + `docs/CALCULATION-API.md` | 순수 함수 + 타입 정의 |
| 3. Supabase 클라이언트 셋업 | `docs/ARCHITECTURE.md` | `lib/supabase/server.ts`, `client.ts`, `middleware.ts` |
| 4. Server Actions 구현 | 함수 시그니처 명세 | `lib/actions/*.ts` |
| 5. UI 컴포넌트 구현 | `docs/UI-DESIGN.md` + 페이지별 명세 | `components/quote-form/*.tsx` |
| 6. 페이지 라우트 구현 | 라우트 명세 | `app/(auth)/`, `app/(app)/` |
| 7. CSV import 로직 | 페인트 CSV 스키마 | `lib/actions/products.ts` + UI |
| 8. 단위 테스트 작성 | Claude가 정한 test plan | `tests/*.test.ts` |
| 9. 버그 수정 (1차) | 버그 리포트 + 재현 단계 | 수정 PR |
| 10. 리팩토링 | 명확한 목표 | 동일 동작·다른 구조 |

### Codex가 하지 말아야 할 일

- ❌ 스코프 결정 ("이거 v1.0 vs v1.1")
- ❌ 아키텍처 변경 (Server Action vs Route Handler 등)
- ❌ 테스트 정책 결정 (커버리지 기준)
- ❌ 보안 정책 결정 (RLS·인증·환경 변수)
- ❌ 외부 라이브러리 추가 선택
- ❌ TODOS.md 항목 추가/제거

---

## Codex 작업 프롬프트 템플릿

```
[작업 #X] {짧은 제목}

**Input docs to read first:**
- docs/ARCHITECTURE.md (전체)
- docs/CALCULATION.md (전체)
- 관련된 다른 파일들

**Task:**
{명확하고 좁은 작업 정의. 예: "lib/calculator.ts를 docs/CALCULATION.md 명세대로 구현하라.
decimal.js 사용. 순수 함수. 사이드 이펙트 없음. Export는 명세의 TypeScript 시그니처 그대로."}

**Out of scope:**
{이번에 하지 말 것 명시. 예: "테스트 작성은 별도 task. UI 통합도 별도 task."}

**Acceptance criteria:**
- TypeScript 컴파일 통과
- ESLint 통과
- {기타 검증 가능한 조건}

**When done:**
변경된 파일 목록과 변경 요약을 보고하라.
```

이 형식이 핵심이다 — Codex는 좁고 명확한 작업에 강하다.

---

## 컨텍스트 공유 방법

두 도구는 **같은 대화 세션을 공유하지 않는다**. 컨텍스트 공유 메커니즘:

| 정보 | 어디에 저장 | 누가 읽나 |
|---|---|---|
| 프로젝트 결정사항 | `docs/*.md`, `CLAUDE.md`, `AGENTS.md` | 둘 다 |
| Claude 메모리 (장기) | `C:\Users\kjm12\.claude\projects\.../memory/` | Claude Code만 |
| Codex 작업 이력 | git commit messages | 둘 다 (Claude는 코드리뷰 시) |
| 임시 작업 노트 | 안 함 (휘발성) | — |

**원칙:** Claude의 결정이 다음 세션·다른 도구에도 유효해야 하면 `docs/`나 `CLAUDE.md`에 박아둔다. Claude 메모리에만 있는 결정은 Codex가 모른다.
