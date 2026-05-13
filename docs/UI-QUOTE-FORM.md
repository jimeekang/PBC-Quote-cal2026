# UI-QUOTE-FORM.md — 견적 작성 페이지 (`/quotes/new`)

> 앱의 메인 작업 화면. 2-column 레이아웃, 한 페이지에서 모든 작업 완결.
> 전체 UI 개요: `docs/UI-DESIGN.md`. 계산 공식: `docs/CALCULATION.md`.

---

## 전체 레이아웃 (≥1280px)

```
┌─ Header ─────────────────────────────────────────────┐
│  ← Quotes    New Quote             [Save Quote]      │
└──────────────────────────────────────────────────────┘

┌─ Left Panel (50%) ────┬─ Right Panel (50%) ──────────┐
│                       │                              │
│  CUSTOMER INFO        │  CALCULATION                 │
│  ─────────────────    │  ──────────────              │
│  Customer (optional)  │  Working Days                │
│  [_________________]  │  [___] days                  │
│                       │                              │
│  Address (optional)   │  Travel Fee    Misc Fee      │
│  [_________________]  │  $ [_____]     $ [_____]     │
│                       │                              │
│  ─────────────────    │  ────────────────────────    │
│  MATERIALS            │  FORMULA RESULTS             │
│  ─────────────────    │                              │
│  [Paint search... ]   │  F1  L500+Market(0%)         │
│  ─ search results ─   │       $2,842.50   ○ min ○ max│
│                       │                              │
│  Dulux Ext White      │  F2  L460+Labour 30%         │
│  2 gal  $68.00   [×]  │       $3,332.50   ○ min ○ max│
│                       │                              │
│  Primer               │  F3  L460+Total 30%          │
│  1 gal  $32.00   [×]  │       $3,435.25   ○ min ○ max│
│                       │                              │
│  ─────────────────    │  F4  L380 Act.+25%           │
│  Market total: $100   │       $2,681.25   ○ min ○ max│
│  Actual total: $72    │                              │
│                       │  F5  L380 Act.+30%           │
│                       │       $2,788.50   ○ min ○ max│
│                       │                              │
│                       │  ────────────────────────    │
│                       │  Subtotal:      $3,111.88    │
│                       │  + Travel:        $80.00     │
│                       │  + Misc:           $0.00     │
│                       │  ────────────────────────    │
│                       │  FINAL          $3,191.88    │
│                       │                              │
└───────────────────────┴──────────────────────────────┘
```

### 반응형 (768px~1279px)

세로 스택: Customer Info → Materials → (구분선) → Working Days/Fees → Formula Results

---

## 컴포넌트 분해

```
QuoteNewPage (Server, /app/(app)/quotes/new/page.tsx)
│
├── Header (back 버튼 + Save 버튼)
│
└── QuoteForm (Client, 'use client')
    │
    ├── CustomerPanel (Left top)
    │   ├── Input: customer_name
    │   └── Input: customer_address
    │
    ├── MaterialsPanel (Left bottom)
    │   ├── PaintSearch (검색 Combobox)
    │   │   ├── Input [debounce 200ms]
    │   │   ├── ResultDropdown (최대 8개)
    │   │   └── CustomItemInline (검색 없을 때)
    │   └── MaterialList
    │       └── MaterialRow × N
    │           ├── 이름, 수량 입력, 가격 표시
    │           └── [×] 삭제 버튼
    │
    ├── CalculationPanel (Right)
    │   ├── WorkingDaysInput
    │   ├── TravelFeeInput + MiscFeeInput
    │   └── FormulaResults
    │       ├── FormulaRow × 5
    │       │   ├── 공식 이름, 금액 (font-mono)
    │       │   └── Min/Max 라디오
    │       └── FinalSummary
    │           ├── Subtotal
    │           ├── Travel + Misc
    │           └── Final (강조 표시)
    │
    └── (SaveAction은 Header 버튼이 trigger)
```

---

## 상태 관리

`QuoteForm`이 모든 상태를 소유하는 단일 Client Component.

```typescript
interface QuoteFormState {
  customerName: string
  customerAddress: string

  materials: MaterialItem[]  // { id, productId?, name, marketPrice, actualPrice, quantity, isCustom }

  workingDays: string        // 문자열로 보관 (입력 UX)
  travelFee: string
  miscFee: string

  selectedMin: 1|2|3|4|5
  selectedMax: 1|2|3|4|5

  isSaving: boolean
  saveError: string | null
}

// 파생 상태 (useMemo)
// - materialMarketTotal: Decimal
// - materialActualTotal: Decimal
// - formulaResults: FormulaResult[]  ← calculateAllFormulas() 호출
// - subtotal: Decimal                ← calculateSubtotal() 호출
// - finalTotal: Decimal              ← calculateFinal() 호출
```

파생 상태는 `useMemo`로 계산. 인풋이 바뀔 때마다 자동 재계산. 서버 왕복 없음.

---

## 페인트 검색 (PaintSearch)

```
1. 사용자 입력 (debounce 200ms)
2. Server Action searchProducts(query) 호출
3. 결과 드롭다운 표시 (최대 8개)
   - 각 항목: 이름, 제조사, market_price / actual_price
4. 선택 → MaterialList에 추가
5. 검색 결과 없음 → '+ Add "xxx" as custom item' 표시
   - 클릭 → 이름만 채워진 MaterialRow 추가 (market/actual 직접 입력)

검색 없음 상태:
[ brush          ×]
─────────────────
No results for "brush"
+ Add "brush" as custom item
```

---

## 공식 결과 표시 (FormulaRow)

```
F1  L500 + Market (no margin)
       $ 2,842.50          ○ min  ○ max

F2  L460 + Labour 30%
       $ 3,332.50          ○ min  ○ max
```

- 금액은 `font-mono text-right` — 자릿수 정렬
- 작업일수 0이면 회색 `$—` 표시
- 선택된 min: 파란 배경 강조 (ring-blue-500)
- 선택된 max: 보라 배경 강조 (ring-purple-500)
- min == max면 노란 배경 (같은 공식 선택, 허용)

---

## 경고 배지

| 조건 | 위치 | 메시지 |
|---|---|---|
| 자재 없음 | 자재 패널 상단 | "No materials added — formula uses $0 material cost" |
| material_actual > material_market | 자재 소계 옆 | "⚠ Actual > Market" |
| working_days > 365 | 일수 인풋 옆 | "Over 365 days — double check" |

---

## 저장 흐름

```
[Save Quote] 클릭
  → QuoteForm validation (client-side, Zod)
    → 실패: 인풋 옆 에러 메시지 (toast 아님)
    → 성공: createQuote() Server Action 호출
      → isSaving = true, 버튼 disabled + 스피너
      → 성공: toast "Quote saved!" + router.push('/quotes')
      → 실패: toast error (red) + isSaving = false
```

---

## 헤더 영역

```
← Quotes    New Quote                    [Save Quote]
             (unsaved indicator: 파란 점)
```

- "← Quotes": router.back() 또는 Link to /quotes
- "New Quote": 페이지 타이틀
- 미저장 변경사항 있으면 타이틀 옆에 파란 점 (·)
- [Save Quote]: primary action 버튼
