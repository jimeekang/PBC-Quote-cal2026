# SECURITY.md — 보안 규칙 & 위험 작업 (공용)

> Claude·Codex 모두 이 규칙을 절대 어기지 말 것.

---

## 절대 금지 사항

### 1. 환경 변수 commit 금지

- `.env*` 파일은 `.gitignore`에 등록
- `.env.example`만 commit (placeholder 값으로)
- 비밀번호·API 키 절대 commit 금지

### 2. `SUPABASE_SERVICE_ROLE_KEY` 사용 제한

- **Server Actions에서만 사용**
- Client Component에서 import 금지
- 브라우저 번들에 절대 포함 금지

### 3. 민감 정보 로그 금지

- `actual_price` (실 원가) 로그 출력 금지
- 사용자 이메일·고객 정보 로그 최소화
- `console.log` 디버깅 후 반드시 제거

### 4. Raw SQL 회피

- Supabase 클라이언트 사용 (자동 parameterized)
- 불가피하게 raw query 필요 시 **parameterized query** 사용
- 문자열 concat으로 SQL 만들기 금지

### 5. XSS 방지

- `dangerouslySetInnerHTML` 금지
- React 자동 escape 사용
- 사용자 입력은 항상 Zod 검증

### 6. Jobber API token (v1.1)

- Server-side 저장만 (`jobber_tokens` 테이블 또는 user metadata)
- 클라이언트에 절대 노출 금지
- Refresh token 자동 갱신 구현

---

## RLS (Row-Level Security)

- **모든 테이블 RLS 켜기** (`enable row level security`)
- v1.0: 모든 인증 사용자 동일 권한
- 미인증 사용자: 모든 테이블 접근 거부 (`auth.role() = 'authenticated'` 정책)
- RLS 자동 테스트 (`tests/rls.test.ts`)로 검증 필수

---

## 위험 작업 (사용자 명시 승인 필요)

다음 작업은 **사용자가 명시적으로 승인하기 전까지 실행 금지**:

| 작업 | 영향 |
|---|---|
| 프로덕션 Supabase DB 마이그레이션 적용 | 데이터 손실 가능 |
| Vercel 환경 변수 변경 | 서비스 중단 가능 |
| Vercel 도메인 설정 변경 | 도메인 무효화 가능 |
| 사용자 데이터 영구 삭제 (quotes, products bulk delete) | 복구 불가 |
| `git push --force` | 다른 사람의 작업 손실 |
| `git reset --hard` | 로컬 작업 손실 |
| Jobber OAuth 앱 설정 변경 (v1.1+) | 인증 중단 |
| `package.json` 메이저 버전 업그레이드 | 브레이킹 체인지 위험 |
| 새 외부 의존성 추가 | 보안·라이선스 검토 필요 |

### 사용자 승인 받는 방법

1. 작업 의도를 명확히 설명 ("Production DB에 마이그레이션 0003을 적용하려고 합니다")
2. 영향 범위·롤백 가능성 알림
3. 사용자 "예/확인" 응답 받은 후에만 실행
4. 자동 진행 금지

---

## 코드 리뷰 보안 체크리스트

PR 머지 전 다음을 반드시 확인:

- [ ] 환경 변수가 클라이언트 번들에 포함되지 않음
- [ ] `SERVICE_ROLE_KEY`가 Server Actions에서만 사용됨
- [ ] 모든 Server Action에 Zod 검증 있음
- [ ] RLS 정책이 새 테이블에도 적용됨
- [ ] 사용자 입력 → DB 흐름에 SQL injection 가능성 없음
- [ ] 민감 정보 (`actual_price`, 이메일)가 응답 페이로드에 불필요하게 포함되지 않음
- [ ] `dangerouslySetInnerHTML` 사용 없음
- [ ] 새 의존성이 사용자 승인을 받았는지

---

## 충돌·의심 상황

| 상황 | 행동 |
|---|---|
| "이거 보안에 영향 있을까?" | 사용자에게 물어보고 진행 |
| RLS 정책 변경 필요 | 사용자 승인 + `tests/rls.test.ts` 통과 후 머지 |
| 새 외부 API 키 필요 | 사용자에게 키 발급·저장 방법 문의 |
| 동일 버그 3회 시도 실패 | 중단, `gstack-investigate` 또는 사용자 문의 |

---

> 문서 변경 이력은 `PROGRESS.md` 참조.
