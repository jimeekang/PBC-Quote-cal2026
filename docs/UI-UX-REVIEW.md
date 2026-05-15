# PBC 견적 계산기 — UI/UX 디자인 리뷰

> **검토 일자:** 2026-05-15
> **검토 대상:** v1.0 구현 중인 모든 페이지 및 컴포넌트
> **검토 방식:** 코드베이스 정적 분석 (라이브 브라우저 검사 불가 환경)
> **검토 범위:** `app/`, `components/`, `globals.css` 전체

---

## 0. 개요 (TL;DR)

**제품 성격:** 사내 직원 1-4명이 매일 쓰는 견적 계산 도구. 마케팅/외부 노출 없음. 데이터 밀집형 App UI.

**전체 등급**

| 항목 | 등급 | 한줄 평 |
|---|---|---|
| Visual Hierarchy | C+ | 회색조가 너무 강해 중요 정보가 묻힘. Final Total만 유일하게 시선을 잡음 |
| Typography | C- | Arial 시스템 폰트 사용. 폰트 가족 정의 없음. 크기 스케일 비체계적 |
| Color & Contrast | C | 회색 8단계 위주, 액센트 색 미정의. 다크모드 변수만 있고 실제 미적용 |
| Spacing & Layout | B- | Tailwind 스케일 일관됨. 그러나 max-width가 페이지마다 다름 (4xl/6xl/7xl) |
| Interaction States | C+ | hover만 있고 focus-visible/active/pressed 없음. 키보드 사용자 위험 |
| Responsive | B | 대부분 모바일 대응. material-row의 6열 그리드는 좁은 화면에서 깨질 위험 |
| Content/Microcopy | C | "X" 삭제 버튼, 영어 일관성 부족 (Quote/Jobber 혼용), 공허한 빈 상태 |
| AI Slop | B+ | 보라색 그라디언트·아이콘 원·블롭 없음. 사내 도구라 깔끔함 유지 |
| Motion | F | 전환 애니메이션 0개. `transition-colors`만 1군데 |
| Performance Feel | B | Server Components 기본, 검색 디바운스 있음. 로딩 스켈레톤 없음 |

**Design Score 종합: C+ (66/100)**
**AI Slop Score: B+ (84/100)** — 사내 도구라 마케팅 슬랍 패턴이 없음

**가장 시급한 3가지**
1. **포커스 링 부재** — 키보드 탭 시 어디 있는지 안 보임. WCAG 위반
2. **삭제 버튼이 텍스트 "X"** — material-row의 X는 글자 X자(eks). 시각 노이즈 + 의미 불명
3. **Final Total 외에 시선 앵커 없음** — F1~F5 카드가 비슷한 크기로 5개 나열, 어디부터 봐야 할지 모름

---

## 1. 디자인 시스템 분석

### 1.1 현재 상태 (코드에서 추출)

[globals.css](../app/globals.css):
```css
--font-sans: Arial, Helvetica, sans-serif;   /* 시스템 폴백만 */
--font-mono: "Courier New", Courier, monospace;
--background: #ffffff;
--foreground: #171717;
```

**관찰 1: 폰트 시스템 부재**
- Arial은 OS 기본 시스템 폰트 폴백. 의도적 타이포 결정이 아님
- Next.js의 `next/font/google` 미사용. 폰트 로딩 최적화 없음
- 숫자에 `font-mono` (Courier New) 사용은 OK — 견적 금액 정렬에 유효
- 그러나 본문은 Inter, Geist, 또는 system-ui로 가야 함

**관찰 2: 색상 시스템 임시방편**
실제 사용 색상 (Tailwind 클래스 grep 결과):
- **회색:** `gray-50, 100, 200, 300, 400, 500, 600, 700, 900` (9단계 — 너무 많음)
- **슬레이트:** `slate-700, 800` (primary CTA 색)
- **블루:** `blue-50, 100, 300, 500, 600, 700` (보조 액센트, 일관성 없음)
- **앰버:** `amber-50, 200, 300, 600, 700, 800` (경고 + draft 메시지)
- **레드:** `red-50, 200, 600, 700` (에러 + 삭제)
- **그린:** `green-50, 600, 700, 800` (성공)
- **퍼플:** `purple-50, 300` (formula max 표시)

**문제점:**
- **Primary 액센트가 슬레이트 700**(거의 검정). 브랜드 색이 없음. 페인팅 회사인데 페인트스러운 색 한 점도 없음
- CSS 변수 `--background`, `--foreground` 정의해놓고 실제로는 `bg-gray-50` 직접 사용 → 변수 활용 안 됨
- 다크모드 변수가 있지만 컴포넌트에 `dark:` prefix 없어서 비활성
- `input { color: #111827 !important }` 같은 `!important` 핵. 시스템 부재의 증거

**관찰 3: 헤딩 스케일 비체계적**
| 위치 | 클래스 |
|---|---|
| 페이지 h1 | `text-2xl font-bold` |
| 카드 h2 | `text-sm font-semibold uppercase tracking-wide` |
| 카드 내 h3 | `text-sm font-semibold` |
| 다이얼로그 h2 | `text-lg font-semibold` |

h1과 h2 사이가 너무 점프함(24px → 14px). h2가 uppercase 라벨 스타일이라 실제로는 h1만 진짜 헤딩 역할. 정보 위계가 평탄해짐.

### 1.2 개선 제안: 디자인 토큰 정의

[app/globals.css](../app/globals.css)에 다음을 추가/교체:

```css
@import "tailwindcss";

:root {
  /* Brand */
  --color-primary: #1e3a8a;        /* PBC blue, 페인트 회사 정체성 */
  --color-primary-hover: #1e40af;
  --color-accent: #0891b2;          /* 보조 액센트 */

  /* Semantic */
  --color-success: #15803d;
  --color-warning: #b45309;
  --color-danger: #b91c1c;

  /* Surface */
  --color-bg: #f8fafc;              /* gray-50 보다 약간 따뜻 */
  --color-surface: #ffffff;
  --color-border: #e2e8f0;

  /* Typography scale (1.25 major third) */
  --font-size-xs: 0.75rem;          /* 12 */
  --font-size-sm: 0.875rem;         /* 14 */
  --font-size-base: 1rem;           /* 16 */
  --font-size-lg: 1.25rem;          /* 20 */
  --font-size-xl: 1.5rem;           /* 24 */
  --font-size-2xl: 2rem;            /* 32 — 견적 최종 금액 강조용 */
}

@theme inline {
  --font-sans: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}
```

**또한:** [app/layout.tsx](../app/layout.tsx)에서 `next/font/google`로 Inter 또는 Geist 로드. Arial 제거.

---

## 2. 페이지별 리뷰

### 2.1 로그인 페이지

**파일:** [app/(auth)/login/page.tsx](../app/(auth)/login/page.tsx), [components/auth/login-form.tsx](../components/auth/login-form.tsx)

**잘된 점**
- 카드 가운데 정렬, max-w-md 적절한 폭
- `autoComplete`, `spellCheck={false}` 잘 설정
- focus ring 있음 (`focus:ring-2 focus:ring-blue-500`) — 유일하게 포커스 스타일이 있는 페이지

**문제점**

| # | 문제 | 영향 | 권장 |
|---|---|---|---|
| L-1 | 브랜드 로고/아이콘 없음 | 신뢰감 0 | SVG 로고 또는 회사명 모노그램 추가 |
| L-2 | 비밀번호 찾기 링크 없음 | 잠금 시 막다른 길 | "Forgot password?" 링크 (Supabase 기본 지원) |
| L-3 | 에러 메시지가 form 맨 아래 | 사용자 입력 후 한참 후에야 봄 | 인풋 바로 아래 또는 form 상단으로 |
| L-4 | 버튼 텍스트 "Sign In" | OK | 한글 UI라면 "로그인"으로 통일 |

### 2.2 견적 목록 페이지 (Quotes)

**파일:** [app/(app)/quotes/page.tsx](../app/(app)/quotes/page.tsx), [components/quote-list/quote-card.tsx](../components/quote-list/quote-card.tsx)

**문제점**

| # | 문제 | 영향 | 권장 |
|---|---|---|---|
| Q-1 | 검색이 디바운스만 있고 로딩 인디케이터 없음 | 결과가 안 바뀌면 검색 중인지 결과 0개인지 구분 불가 | 검색 중 옅은 스피너 또는 "검색 중..." 표시 |
| Q-2 | quote-card에 정렬 정보 없음 | 최신순? 알파벳? | 정렬 드롭다운 (날짜순/금액순) 추가 |
| Q-3 | quote-card 메타가 한 줄 텍스트 `address - X days x Y labour - date` | 정보 위계 평탄, 스캐닝 어려움 | 메타를 2줄로 분리하거나 dl 구조 사용 |
| Q-4 | View/Edit/Delete 세 액션이 같은 줄 | Delete 오클릭 위험 | Delete는 hover/three-dot menu에 숨김 |
| Q-5 | 빈 상태 "No quotes yet." | 무미건조 | "아직 견적이 없어요. 첫 견적을 만들어 보세요" + 일러스트 또는 아이콘 |
| Q-6 | 페이지네이션 없음 | 견적 100개 넘으면 무한 스크롤 | 페이지네이션 또는 가상 스크롤 (사내 도구라 100건 안 넘으면 OK) |
| Q-7 | 필터 없음 | 고객명/주소만 검색 가능 | Jobber ID, 날짜 범위, 금액 범위 필터 |

### 2.3 견적 작성 페이지 (New / Edit Quote) — **가장 중요한 화면**

**파일:** [components/quote-form/quote-form.tsx](../components/quote-form/quote-form.tsx) 외 다수

이 화면이 앱의 90% 사용 시간이 집중되는 화면. 가장 큰 개선 여지가 여기.

#### 2.3.1 레이아웃 구조

현재: `xl:grid-cols-2` — 왼쪽에 입력(Customer/Materials/Options), 오른쪽에 결과(Calculation/Formula/Final).

**잘된 점**
- 입력↔결과를 좌우로 분리 → 실시간 계산 결과를 보면서 입력 가능
- max-w-7xl로 와이드 모니터 활용

**문제점**

| # | 문제 | 영향 | 권장 |
|---|---|---|---|
| QF-1 | 페이지 제목 `New Quote .` — 파란 점 `.`이 붙어있음 ([quote-form.tsx:606](../components/quote-form/quote-form.tsx#L606)) | 의도 불명. 데코인지 버그인지 | 의도라면 의미 부여(예: dirty 인디케이터), 아니면 제거 |
| QF-2 | 1024px~1279px(`lg`)에서 2단 그리드 안 적용 → 모든 게 세로로 스택 | 노트북 사용자 결과를 보려면 스크롤 길게 | `lg:grid-cols-2`로 낮춰 데스크탑 흔한 폭에서 2단 적용 |
| QF-3 | 왼쪽 카드 안에 Customer/Materials/Options 3섹션이 한 카드에 묶임 | 카드가 너무 길어 스크롤 시 컨텍스트 잃음 | 섹션별로 카드 분리 또는 sticky 섹션 헤더 |
| QF-4 | Save 버튼이 페이지 맨 위 우상단에만 있음 | 긴 폼 스크롤 후 다시 위로 가야 함 | 페이지 끝에도 Save 또는 sticky bottom bar |
| QF-5 | 결과 카드가 sticky 아님 | 스크롤 시 실시간 결과 안 보임 | 오른쪽 결과 카드 `lg:sticky lg:top-20` |

#### 2.3.2 Customer Info 패널

**파일:** [components/quote-form/customer-panel.tsx](../components/quote-form/customer-panel.tsx)

| # | 문제 | 권장 |
|---|---|---|
| CP-1 | "Customer / Jobber Quote Number" 둘이 같은 줄 → 라벨이 잘림 위험 | 모바일 우선, 둘을 별도 줄로 |
| CP-2 | Quote/Job 토글이 라벨 옆 inline 토글 → 처음엔 의도 못 알아챔 | 라벨 위에 별도 행으로 명확히 |
| CP-3 | "Fetch" 버튼 텍스트만 — 무슨 API 호출인지 불명 | "Jobber에서 가져오기" 또는 download 아이콘 + 텍스트 |
| CP-4 | JobberQuoteSummary가 그냥 안에 펼쳐짐 → Customer Panel 영역이 매우 길어짐 | 기본 접혀있고 "Jobber 데이터 보기" 토글 |
| CP-5 | `Customer Type` 입력이 readonly인데 일반 input과 시각적으로 거의 동일 | `bg-gray-100` 더 진하게 + 잠금 아이콘 |
| CP-6 | Jobber 라인 아이템 카테고리 배지: `px-1.5 py-0.5 text-[11px]` 너무 작음 | 텍스트 12px 이상, 또는 색상으로 분류 |

#### 2.3.3 Materials Panel & MaterialRow — **가장 문제 많은 컴포넌트**

**파일:** [components/quote-form/materials-panel.tsx](../components/quote-form/materials-panel.tsx), [components/quote-form/material-row.tsx](../components/quote-form/material-row.tsx)

```tsx
// material-row.tsx:28
<div className="mt-2 grid gap-2 md:grid-cols-[3.75rem_4.75rem_1.3fr_4.75rem_4.75rem_2.75rem] md:items-end">
```

**핵심 문제: 6열 그리드 (Qty, RRP, Area, Working Days, Labour/Day, Action)**

| # | 문제 | 영향 | 권장 |
|---|---|---|---|
| MR-1 | 모바일(md 미만)에서 6필드가 세로 스택 → 한 자재가 7행 차지 | 자재 10개면 70행 | 모바일은 카드 형태로 압축, 펼치기 토글 |
| MR-2 | **삭제 버튼이 "X" 문자 ([material-row.tsx:89](../components/quote-form/material-row.tsx#L89))** | 글자 X(eks) 사용. 시각적 X 아이콘 아님 | `lucide-react`의 `<X />` 아이콘 또는 휴지통 아이콘 |
| MR-3 | "Action" 라벨 위에 X 버튼 — 헤더가 액션 자체가 아니라 컬럼 헤더처럼 보임 | 정보 위계 깨짐 | 라벨 제거, 아이콘 버튼만 (aria-label은 유지) |
| MR-4 | RRP 변경 시 actualPrice도 자동 동기화 ([material-row.tsx:40](../components/quote-form/material-row.tsx#L40)) — 시각적 단서 없음 | 사용자가 actual을 별도 편집할 수 없음을 모름 | actualPrice 입력을 노출하거나, 도움말 추가 |
| MR-5 | text-xs (12px) 입력 필드 | 직원이 매일 쓰면 눈 피로 | text-sm (14px) 최소 |
| MR-6 | Area 드롭다운 옵션이 `Interior - bedroom` 형식 | 길고 스캐닝 어려움 | optgroup으로 Interior/Exterior 분리 |
| MR-7 | 입력 6개가 빽빽 — 어디가 핵심(가격)인지 모름 | 정보 위계 평탄 | RRP 셀에 살짝 다른 배경색 또는 굵게 |
| MR-8 | PaintSearch 결과가 absolute z-10 — 모달이나 sticky 헤더와 충돌 위험 | z-index 충돌 시 가려짐 | z-index 정책 정의, 또는 portal 사용 |

#### 2.3.4 Quote Options Panel

**파일:** [components/quote-form/quote-options-panel.tsx](../components/quote-form/quote-options-panel.tsx)

| # | 문제 | 권장 |
|---|---|---|
| QO-1 | 옵션 카드 헤더에 input 직접 노출 — 늘 편집 가능 상태 | 클릭 전엔 텍스트로 표시, 클릭 시 input |
| QO-2 | "Collapse/Edit" 버튼 — 둘이 같은 의미 같은데 한 버튼이 두 상태 | "Collapse"로 통일하고 펼침 상태 아이콘 표시 |
| QO-3 | Delete 버튼이 Collapse 옆에 같은 스타일 | 위험 액션은 색상/아이콘으로 구분 (`text-red-600` 텍스트 버튼) |
| QO-4 | "+ Add Option" 버튼 — 잘 됨, 그러나 옵션이 0개일 때만 강조하면 좋음 | 첫 옵션 추가 전엔 dashed border CTA로 강조 |
| QO-5 | 옵션 안에 MaterialsPanel 재사용 → 카드 안의 카드 중첩 → 시각적 깊이 혼란 | 옵션 내부는 헤더 라벨 없이 indent만 |

#### 2.3.5 Formula Results — **시각적 핵심 컴포넌트**

**파일:** [components/quote-form/formula-results.tsx](../components/quote-form/formula-results.tsx)

```tsx
// 5개 공식 결과를 카드 5개로 나열, 각각 min/max 라디오 버튼
```

| # | 문제 | 영향 | 권장 |
|---|---|---|---|
| FR-1 | F1~F5 카드가 동일 크기 5개 나열 → 위계 0 | 어디부터 봐야 할지 모름 | 선택된 min/max는 카드 크게, 나머지는 축소 |
| FR-2 | min은 파랑(`bg-blue-50`), max는 보라(`bg-purple-50`), 둘 다 선택 시 앰버 | 색상 의미 학습 필요. 앰버는 보통 경고 색 | min=초록, max=빨강 또는 라벨로 명시("이게 최저가, 이게 최고가") |
| FR-3 | min/max 라디오가 카드 내부 작은 텍스트 | 클릭 영역 작음 | 카드 전체를 클릭 가능하게, 라디오는 시각 마커 역할 |
| FR-4 | F1, F2, F3 등 라벨 — 의미 없는 코드명 | 비전문가는 뭐가 뭔지 모름 | `name` 필드 활용 + 툴팁으로 공식 설명 |
| FR-5 | `tabular-nums` 사용 — 좋음. 다른 금액 표시에도 적용 권장 | OK | 모든 금액 column에 적용 |

#### 2.3.6 Final Summary

**파일:** [components/quote-form/final-summary.tsx](../components/quote-form/final-summary.tsx)

**잘된 점**
- Final Total을 `text-2xl font-bold` 로 강조 — 유일하게 위계 잡힌 곳
- 라벨 vs 값 좌우 정렬 일관

**문제점**

| # | 문제 | 권장 |
|---|---|---|
| FS-1 | Labour/Material/Subtotal/GST 모두 같은 색·크기 | Subtotal과 GST는 한 단 들여쓰기로 위계 표현 |
| FS-2 | Jobber profit 막대그래프가 초록 단색 | 마진 낮으면(< 20%) 빨강/주황으로 경고 |
| FS-3 | "Final total" 라벨이 uppercase tracking-wide → 작은 회색 라벨 | Final이라면 라벨도 크게 ("최종 금액") |

#### 2.3.7 Draft / Unsaved 관리

| # | 문제 | 권장 |
|---|---|---|
| DR-1 | "Unsaved draft found" 배너가 amber(경고색) | 정보(파랑) 또는 중립(회색) 톤 |
| DR-2 | beforeunload + 클릭 가로채기 + popstate 가로채기 3중 가드 → 일부 케이스 누락 가능 | OK, 단 모달 디자인 강화 (현재 너무 작음) |
| DR-3 | 모달 "Leave without draft" 버튼이 빨강 outline → 파괴적 액션으로 느껴짐 | OK 의도라면 maintain. 단 confirm 카피 더 명확히 |

### 2.4 견적 상세 페이지

**파일:** [components/quote-detail/quote-detail-view.tsx](../components/quote-detail/quote-detail-view.tsx)

| # | 문제 | 권장 |
|---|---|---|
| QD-1 | Summary와 Formula Results 2단 → 정보 종류 다른데 같은 비중 | Summary가 핵심, 더 크게 |
| QD-2 | Final 금액이 Summary 카드 내부 작은 행 | 페이지 상단에 큰 카드로 |
| QD-3 | Materials 섹션 — 행이 짧고 단조로움 | 자재명/Area/노동량 더 명확히 분리 |
| QD-4 | PDF/Print 액션 없음 | 견적서 출력 기능 (v1.1?) |
| QD-5 | "Copy as new quote" 같은 액션 없음 | 비슷한 견적 복제 흔한 사용 패턴 |

### 2.5 설정 페이지

**파일:** [components/settings/settings-form.tsx](../components/settings/settings-form.tsx)

| # | 문제 | 권장 |
|---|---|---|
| ST-1 | 탭 3개 (Labour/Material/Area)가 같은 카드 안 | OK, 단 active 탭 표시가 `border-b-2 border-slate-700` 만 — 색 너무 흐림 |
| ST-2 | Margin 입력 도움말 "Use 30 or 0.30 or 30%" | 사용자가 헷갈리는 신호. 한 형식만 강제하고 자동 변환 |
| ST-3 | "Save Settings" 후 메시지가 평문 텍스트 | toast 또는 인풋 옆 체크마크 |
| ST-4 | Material 테이블 — 7컬럼 → 모바일에서 가로 스크롤만 | 모바일은 카드 뷰로 |
| ST-5 | Edit/Delete 버튼이 행마다 노출 → 시각 노이즈 | hover 시 노출 또는 dropdown |
| ST-6 | Area 목록이 단순 리스트, 편집/삭제 불가 | 편집·삭제·재정렬 UI 추가 |
| ST-7 | CSV Import 에러 메시지 — 어느 행이 문제인지 모름 | 행 번호 + 컬럼명 명시 |
| ST-8 | Margin 섹션 — F2~F5 마진만 있고 F1 마진은 없는데 설명 없음 | "F1은 마진 없음 (원가 공식)" 안내 |

### 2.6 헤더

**파일:** [components/layout/app-header.tsx](../components/layout/app-header.tsx)

| # | 문제 | 권장 |
|---|---|---|
| H-1 | 로고/아이콘 없음, 텍스트 "PBC Quote Calculator"만 | SVG 로고 또는 첫 글자 모노그램 |
| H-2 | 현재 페이지 표시 없음 | 활성 링크 underline 또는 색 변경 |
| H-3 | Sign out이 `text-gray-400` — 너무 흐림 | `text-gray-600` 또는 우측 끝에 사용자 이메일 + 드롭다운 |
| H-4 | "New Quote" CTA가 헤더에 — 견적 목록에도 있음. 중복 | 헤더 또는 페이지 한 곳만 |
| H-5 | 모바일 메뉴 없음, 그대로 노출 | 1-4명 사내 도구라 OK, 단 좁은 폭에서 잘림 검토 |

---

## 3. 글로벌 이슈 (모든 화면)

### 3.1 접근성 (Accessibility)

| # | 이슈 | 심각도 |
|---|---|---|
| A-1 | `focus-visible` 또는 `focus:ring` 거의 없음 (로그인만 있음) | **High** — WCAG 위반 |
| A-2 | `aria-label` 일부만 (`X` 버튼은 있음) — 다른 아이콘 버튼들 누락 가능성 | Medium |
| A-3 | `role="alert"` 로그인 에러에만 있음, 다른 에러 메시지엔 없음 | Medium |
| A-4 | 다이얼로그(`pendingNavigation`)에 `role="dialog"`, `aria-modal` 없음 | High |
| A-5 | 컬러 콘트라스트 `text-gray-400` (#9ca3af) on white → 2.85:1 (WCAG AA 미달 4.5:1) | High — Sign out 버튼, draft 메시지 등 |
| A-6 | 폼 검증 — 빈 인풋 시 메시지 위치/aria-describedby 없음 | Medium |

### 3.2 모션 & 트랜지션

거의 0. 단 한 군데 `transition-colors` ([login-form.tsx:47](../components/auth/login-form.tsx#L47)).

**권장 (최소)**
- 버튼 hover: 150ms ease-out
- 카드 hover (quote-card): subtle shadow lift
- 모달 fade-in: 200ms
- `prefers-reduced-motion` 존중

### 3.3 빈 상태 / 로딩 상태

| 화면 | 현재 빈 상태 | 권장 |
|---|---|---|
| Quotes 목록 | "No quotes yet." + 텍스트 링크 | 아이콘 + 카피 + Primary CTA |
| Materials | "No materials added - formula uses $0 material cost." | OK, 단 amber 톤은 경고처럼 보임 → 중립 톤 |
| Options | "No optional add-ons." | OK |
| Settings/Areas | "No areas yet." | "+ 첫 영역 추가" CTA 직접 노출 |
| Settings/Materials | 빈 상태 없음 (CSV import 미실행 시 비어있음) | "CSV 가져오기 또는 직접 추가" 빈 상태 |

**로딩 상태**
- 검색, 페치, 저장 모두 텍스트만 (`Loading`, `Saving...`, `Fetching`)
- 스켈레톤 0개
- → 최소한 스피너 아이콘 추가 권장

### 3.4 마이크로카피

- "X" → "삭제" 또는 휴지통 아이콘
- "No materials added - formula uses $0 material cost." → 영문 일관성 OK이지만 `-`는 em dash나 콜론으로
- "Working Days" vs "Labour Per Day" — 단위(일/$/일) 라벨 옆에 명시
- "Material total" vs "Labour total" vs "Final total" — 대소문자/스타일 일관 필요 (현재 "Final total" 만 라벨 스타일 다름)
- 한글 UI 안 함 — 한국어 사용자라면 한글화 고려 (사내 도구라 영문 유지도 OK)

---

## 4. AI Slop 체크

| 패턴 | 발견 | 비고 |
|---|---|---|
| 보라/인디고 그라디언트 | ❌ 없음 | 굿 |
| 3컬럼 아이콘 그리드 | ❌ 없음 | 굿 |
| 컬러 원 안 아이콘 | ❌ 없음 | 굿 |
| 전부 가운데 정렬 | ❌ 없음 | 굿 |
| 균일한 둥근 모서리 | ⚠️ 모든 게 `rounded-md` | 카드와 버튼이 동일 radius. 차등 권장 |
| 데코 블롭/웨이브 | ❌ 없음 | 굿 |
| 이모지 데코 | ❌ 없음 | 굿 |
| 컬러 좌측 보더 카드 | ⚠️ `border-blue-100 bg-blue-50` Optional add-ons 한 군데 | 미니멀 — OK |
| 일반적 hero 카피 | ❌ 마케팅 화면 없음 | N/A |
| 쿠키커터 섹션 리듬 | ❌ 사내 도구 | N/A |

**평가:** AI 슬랍 패턴은 거의 없음. 사내 도구라 마케팅 슬랍이 들어올 자리가 없었던 게 다행. 단 "균일한 rounded-md"는 hierarchy 부재의 다른 표현.

---

## 5. 우선순위별 개선 로드맵

### P0 — 1주 내 (사용자 영향 직접)

1. **포커스 스타일 전역 추가** — `globals.css`에 모든 인터랙티브 요소 기본 focus-visible 링
2. **삭제 버튼 X → 휴지통 아이콘** — `lucide-react` 설치 후 적용
3. **WCAG 콘트라스트 수정** — `text-gray-400` 사용 모든 곳 `text-gray-600` 이상으로
4. **다이얼로그 a11y** — `role="dialog"`, `aria-modal`, 포커스 트랩

### P1 — 2주 내 (사용 경험 큰 영향)

5. **폰트 시스템 도입** — `next/font/google`로 Inter 또는 Geist
6. **브랜드 색 정의** — primary, accent, semantic 색 토큰화
7. **결과 카드 sticky** — `lg:sticky lg:top-20` for 견적 작성 페이지 우측
8. **Formula Results 위계 강화** — 선택된 min/max 카드만 강조, 나머지 축소
9. **로딩 스켈레톤** — 견적 목록, 견적 상세에 추가
10. **삭제 액션 분리** — quote-card에서 Delete를 dropdown menu로

### P2 — 4주 내 (폴리시)

11. **모션 추가** — 버튼/카드 hover, 모달 fade
12. **빈 상태 일러스트** — Quotes 목록, Settings/Materials
13. **PDF/Print 견적서 출력** — quote-detail
14. **모바일 자재 행 카드뷰** — 6열 그리드 대체
15. **Settings 탭 디자인 개선** — active 탭 색상 강화
16. **헤더 활성 페이지 인디케이터**

### P3 — 차후 (전략적)

17. **다크 모드 실제 구현** — 변수만 있고 미구현
18. **한글화 검토** — 사내 도구라면 한국어 UI 가능
19. **DESIGN.md 작성** — 토큰·컴포넌트·패턴 문서화
20. **컴포넌트 라이브러리** — Button, Input, Card 등 wrapper 컴포넌트

---

## 6. 즉시 적용 가능한 빠른 수정 (Quick Wins)

각 30분 이내 작업:

### Quick Win 1: 포커스 링 전역화
[app/globals.css](../app/globals.css) 추가:
```css
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 4px;
}
button:focus-visible, a:focus-visible, [role="button"]:focus-visible {
  outline-color: #1e40af;
}
```

### Quick Win 2: 콘트라스트 일괄 교체
- `text-gray-400` → `text-gray-500` (콘트라스트 3.4 → 4.6)
- `text-gray-500` → 본문은 `text-gray-600`

### Quick Win 3: X 버튼 → 휴지통 아이콘
`npm install lucide-react` 후 [material-row.tsx:89](../components/quote-form/material-row.tsx#L89):
```tsx
import { Trash2 } from 'lucide-react'
// ...
<button type="button" onClick={onRemove} aria-label={`Remove ${item.name}`}
  className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300">
  <Trash2 className="h-3.5 w-3.5" />
</button>
```

### Quick Win 4: 페이지 제목 점 제거
[quote-form.tsx:606](../components/quote-form/quote-form.tsx#L606) — 의도 불명한 ` <span className="text-blue-500">.</span>` 제거.

### Quick Win 5: Final Total 더 크게
[final-summary.tsx:59](../components/quote-form/final-summary.tsx#L59) `text-2xl` → `text-3xl`, 그리고 라벨도 `text-base font-semibold` (현재 uppercase 작은 라벨)

### Quick Win 6: 모달 a11y
[quote-form.tsx:700-718](../components/quote-form/quote-form.tsx#L700-L718):
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title" ...>
  <h2 id="leave-dialog-title" className="text-lg font-semibold">Save draft before leaving?</h2>
```

### Quick Win 7: Sticky 결과 카드
[quote-form.tsx:659](../components/quote-form/quote-form.tsx#L659):
```tsx
<div className="space-y-6 rounded-md border border-gray-200 bg-white p-5 xl:sticky xl:top-6 xl:self-start">
```

---

## 7. 종합 의견

이 앱은 **사내 1-4명용 도구**임을 고려하면 현재 수준은 "기능적으로 OK, 그러나 매일 쓰기엔 거친 상태." 마케팅 페이지가 아니라 AI 슬랍이 들어올 자리가 없는 것은 다행이지만, **매일 1~4명이 수십 번 클릭할 도구**임을 고려하면 다음 두 축에서 보완이 가장 큰 ROI:

1. **타이포 + 색상 시스템 정의** — Arial과 9단계 회색을 벗어나면 즉시 전문가스러워짐. 1일 작업
2. **시선 앵커 강화** — 견적 작성 화면에서 Final Total, 선택된 Formula 카드만 강조하면 매일 쓰는 사람의 인지 부하 크게 감소. 0.5일 작업

**가장 큰 디자인 적자: 모션 0개, 포커스 링 부재, 폰트 시스템 부재.** 이 셋 중 하나라도 잡으면 체감 품질이 한 단계 올라간다.

---

> **다음 단계 제안:**
> - 위 P0 4건을 한 PR로 묶어 처리 (예상: Codex 작업 30-60분)
> - 그 후 `/gstack-design-consultation` 실행으로 `DESIGN.md` 작성, 토큰·컴포넌트 라이브러리 시작
> - v1.0 출시 전 P1 9건 추가 처리 권장
