# CODING-STYLE.md — 코딩 규칙 (공용)

> Codex는 코드 작성·리뷰 시 이 규칙을 강제한다.

---

## TypeScript & 컴포넌트

- **TypeScript strict mode**
- `any` 타입 금지 (`unknown` 사용)
- 함수형 컴포넌트 + hooks (no class components)
- Server Components 기본, Client Components는 `'use client'` 명시
- Server Actions에서 Zod 검증 필수

---

## 명명 규칙

| 영역 | 규칙 | 예 |
|---|---|---|
| 파일 | kebab-case | `quote-form.tsx`, `paint-search.tsx` |
| 컴포넌트 | PascalCase | `QuoteForm`, `PaintSearch` |
| 함수·변수 | camelCase | `calculateAllFormulas`, `currentSettings` |
| 상수 | UPPER_SNAKE_CASE | `MAX_QUOTE_ITEMS` |
| Server Actions | 동사 시작 | `createQuote`, `updateQuote`, `searchProducts` |
| DB 컬럼 | snake_case | `customer_name`, `created_at` |

---

## 금액 처리 (필수)

`docs/DECISIONS.md` #5 "금액 정밀도"를 정확히 따른다.

```typescript
// ✅ 항상 이렇게
import Decimal from 'decimal.js';

function calculateFormula4(
  D: number,
  materialActual: Decimal,
  settings: PricingSettings
): Decimal {
  return new Decimal(settings.f4LabourRate)
    .mul(D)
    .add(materialActual)
    .div(new Decimal(1).minus(settings.f4Margin));
}

// UI 표시 직전에만 변환
const displayValue = formula4Result.toFixed(2);

// ❌ 절대 금지 (부동소수점 오차 발생)
const total = (380 * D + material) / 0.75;
```

---

## Server Action 표준 패턴

```typescript
'use server';
import { z } from 'zod';

const quoteSchema = z.object({
  workingDays: z.number().nonnegative(),
  travelFee: z.number().nonnegative().default(0),
  // ... 명세 따라
});

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function createQuote(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('quotes')
    .insert(parsed.data)
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}
```

**원칙:**
- 모든 Server Action은 `Result<T>` 패턴 반환
- 입력 검증은 Zod `safeParse`
- 예외는 try/catch로 잡고 `{ ok: false, error }`로 변환
- DB 에러도 동일 패턴

---

## 주석 정책

- **기본:** 주석 없이 self-documenting 코드
- **예외:** **왜** 이 코드가 있는지가 비자명할 때
  - workaround (특정 버그 회피)
  - 도메인 지식 (PBC 비즈니스 규칙)
  - 미묘한 불변식
- **ASCII 다이어그램:** 복잡한 상태 머신·데이터 흐름·UI 레이아웃에 권장

**금지:**
- 무엇(WHAT)을 하는지 설명하는 주석 (이름이 이미 설명함)
- 현재 태스크 번호, PR 번호 같은 일시적 정보
- "// TODO" 남발 (TODOS.md에 적기)

---

## 파일 구조

```
lib/
├── calculator.ts        # 순수 계산 함수 (decimal.js)
├── validators.ts        # Zod 스키마
├── utils.ts             # 포맷 helper (cn, currency, decimal format)
├── supabase/
│   ├── client.ts        # 브라우저용 anon client
│   ├── server.ts        # 서버용 client + service role
│   ├── middleware.ts    # 세션 갱신 helper
│   └── types.ts         # Database 타입
└── actions/
    ├── auth.ts          # signIn, signOut
    ├── quotes.ts        # createQuote, updateQuote, getQuote, listQuotes
    ├── products.ts      # searchProducts, importProductsFromCSV
    └── settings.ts      # getPricingSettings, updatePricingSettings

components/
└── quote-form/          # QuoteForm 관련 컴포넌트들
    ├── QuoteForm.tsx
    ├── WorkInputSection.tsx
    ├── PaintSearchSection.tsx
    ├── FormulaResultsSection.tsx
    ├── SubtotalSection.tsx
    └── FinalSummary.tsx

app/
├── (auth)/login/page.tsx
└── (app)/
    ├── quotes/page.tsx
    ├── quotes/new/page.tsx
    ├── quotes/[id]/page.tsx
    └── settings/page.tsx
```

---

## 작업 단위 (PR 단위)

한 PR / 한 작업은 다음 중 **하나에만** 집중:

- 하나의 DB 마이그레이션 파일
- 하나의 lib/ 모듈
- 하나의 Server Action 그룹
- 하나의 페이지 + 그 페이지의 컴포넌트들
- 하나의 버그 수정

**금지:**
- DB 마이그레이션 + UI 변경 + 테스트 묶어서 한 PR
- 명시되지 않은 리팩토링 끼워넣기
- TODO 코멘트로 본 작업 외 항목 처리

---

> 문서 변경 이력은 `PROGRESS.md` 참조.
