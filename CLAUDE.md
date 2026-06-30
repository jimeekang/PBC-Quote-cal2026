# CLAUDE.md — Deprecated

> 현재 이 프로젝트는 Claude Code를 사용하지 않는다.
> 최신 운영 기준은 `AGENTS.md`, `docs/WORKFLOW.md`, `docs/AGENT-MAP.md`를 따른다.

---

## 현재 기준

- Codex가 결정자(Decider)이자 실행자(Executor)다.
- 설계·아키텍처·테스트 정책·구현·검증은 Codex가 사용자 지시와 문서 기준에 따라 수행한다.
- 모든 주요 작업의 기본 모델 기준은 `codex 5.5 extra high`다.
- 핵심 결정 변경, 보안 critical 변경, 프로덕션 DB 적용, 새 외부 의존성 추가는 사용자 명시 승인 후 진행한다.

---

## 참고 문서

| 문서 | 용도 |
|---|---|
| `AGENTS.md` | Codex 진입점·역할·작업 규칙 |
| `docs/WORKFLOW.md` | Codex 중심 작업 흐름 |
| `docs/AGENT-MAP.md` | 작업 유형별 필독 문서 매트릭스 |
| `docs/DECISIONS.md` | 핵심 결정 사항 |
| `PROGRESS.md` | 진행 현황과 변경 이력 |

---

> 이 파일은 과거 호환을 위해 남겨둔다. 새 작업 지시는 `AGENTS.md` 기준으로 처리한다.
