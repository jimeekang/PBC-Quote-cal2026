# WORKFLOW.md — Codex 중심 작업 흐름

> 현재 프로젝트는 Claude Code를 사용하지 않는다. Codex가 사용자와 직접 협의해 설계·아키텍처·테스트 정책·구현·검증을 수행한다.
> Phase별 상세 작업과 프롬프트 템플릿: `docs/WORKFLOW-TASKS.md`.

---

## 역할 분담 (TL;DR)

| 영역 | 담당 | 기준 |
|---|---|---|
| 설계 (Design) | Codex | 사용자 요구, 기존 문서, superpowers/gstack 스킬 |
| 아키텍처 | Codex | `docs/ARCHITECTURE.md`, `docs/DB-SCHEMA.md`, `docs/SECURITY.md` |
| UI/UX 설계 | Codex | `docs/UI-DESIGN-SYSTEM.md`, `docs/UI-DESIGN.md`, 기존 화면 패턴 |
| 테스트 설계 & 작성 | Codex | `docs/DECISIONS.md` 테스트 정책, Vitest 기준 |
| 기능 구현 | Codex | 기존 코드 패턴과 문서화된 결정 |
| 버그 수정 | Codex | 재현 → 원인 확인 → 최소 수정 → 검증 |
| 코드 리뷰 | Codex | diff 기반 자체 리뷰, 필요 시 `gstack-review` 또는 `review` |
| QA/배포 | Codex | `docs/DEPLOY.md`, `docs/CLI-ACCESS.md`, 사용자 승인 규칙 |

---

## 모델 라우팅

이 프로젝트의 모든 주요 작업은 기본적으로 **`codex 5.5 extra high`** 모델 기준으로 수행한다.
런타임에서 모델을 직접 선택할 수 없으면 task 제목이나 프롬프트 첫 줄에 원하는 등급을 표시한다.

| 작업 유형 | 권장 모델 | 적용 예 |
|---|---|---|
| 계획·아키텍처·테스트 전략·복잡한 보안 판단 | `codex 5.5 extra high` | upgrade plan, DB/RLS 설계, plan review |
| 일반 기능 구현 | `codex 5.5 extra high` | migration, Server Action, UI, test 구현 |
| 단순 작업·반복 수정 | `codex 5.5 extra high` | 문구 수정, import 정리, 기계적 테스트 fixture 보강 |

이 규칙은 비용과 구현 효율을 위한 라우팅 기준이다. 시스템·개발자·사용자 지시, 보안 승인 규칙, 새 의존성 승인 규칙을 대체하지 않는다.

---

## 핵심 원칙

### 1. Codex가 결정자이자 실행자

- Codex가 *무엇을, 왜, 어떻게* 만들지 사용자와 협의해 결정한다.
- 결정은 `docs/`에 남겨 다음 세션에서도 같은 기준으로 이어간다.
- 불명확한 요구는 추측하지 않고 질문한다.

### 2. 산출물은 문서로 보존

- 설계 결정은 `docs/` 또는 `docs/superpowers/specs/`에 저장한다.
- 구현 계획은 `docs/superpowers/plans/`에 저장한다.
- 작업 결과와 검증 이력은 `PROGRESS.md`에 남긴다.

### 3. 검증은 구현과 같은 책임

- 변경 후 typecheck, lint, 관련 테스트를 실행한다.
- DB/RLS/OAuth/민감 데이터 변경은 `docs/SECURITY.md`를 먼저 확인한다.
- 프로덕션 DB 적용, Vercel 환경 변수 변경, 사용자 데이터 삭제, force push/reset, 새 외부 의존성 추가는 사용자 명시 승인 없이는 하지 않는다.

### 4. 관련 스킬 우선

- 새 기능 구상: `superpowers:brainstorming`
- 구현 계획: `superpowers:writing-plans`
- 핵심 로직: `superpowers:test-driven-development`
- 복잡한 버그: `superpowers:systematic-debugging` 또는 `gstack-investigate`
- 완료 전 검증: `superpowers:verification-before-completion`

---

## 작업 흐름 (새 기능 추가)

```text
1. 사용자 요청
   ↓
2. Codex: 문제 정의와 요구사항 확인
   - 목적, 데이터 출처, 권한, 파일 출력, 성공 기준 확인
   - 산출물: 짧은 설계 요약 또는 design doc
   ↓
3. Codex: 아키텍처·테스트·엣지 케이스 정리
   - DB/RLS/API/UI/테스트 범위 잠금
   - 산출물: 구현 계획 또는 task breakdown
   ↓
4. Codex: 구현
   - DB 마이그레이션 → Server Actions/Route Handlers → UI → 테스트
   ↓
5. Codex: 검증
   - typecheck, lint, test, 필요 시 browser QA
   ↓
6. Codex: 완료 보고
   - 변경 파일, 테스트, 남은 리스크, 다음 단계
```

---

## 충돌 처리

### 문서와 사용자 지시가 다를 때

- 사용자가 최신 결정을 명시하면 사용자 지시가 우선한다.
- 핵심 결정이 바뀌는 경우 관련 문서를 함께 업데이트한다.

### 문서끼리 충돌할 때

- `docs/DECISIONS.md`가 최우선 source of truth다.
- 그 다음 `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/CODING-STYLE.md`, 세부 설계 문서 순서로 따른다.
- 충돌을 해결하면 관련 문서를 정리한다.

### 버그가 반복될 때

- 같은 영역에서 3번 이상 실패하면 `superpowers:systematic-debugging` 또는 `gstack-investigate` 흐름으로 재현과 원인을 먼저 고정한다.

---

## 관련 문서

- Phase별 상세 작업 + Codex 프롬프트 템플릿: `docs/WORKFLOW-TASKS.md`
- 진입점·작업별 필독 파일 매트릭스: `docs/AGENT-MAP.md`
- Codex 태스크 상세 명세: `docs/CODEX-TASKS.md`
