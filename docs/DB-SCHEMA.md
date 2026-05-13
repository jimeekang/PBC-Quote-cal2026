# DB-SCHEMA.md — 데이터베이스 스키마 & RLS

> Supabase Postgres 테이블·인덱스·RLS 정책 정의. ARCHITECTURE.md에서 분리.
> 스키마 변경은 사용자 승인 후 새 마이그레이션 파일로만 진행.

---

## 테이블 관계도

```
┌──────────────────┐         ┌─────────────────┐
│   auth.users     │         │ pricing_settings│
│  (Supabase Auth) │         │  (singleton)    │
└────────┬─────────┘         └────────┬────────┘
         │ created_by                  │ snapshot
         │ updated_by                  │ (JSONB copy)
         ▼                             ▼
┌──────────────────────────────────────────┐
│              quotes                       │
│  - id (uuid)                              │
│  - customer_name, address, sqft, type     │
│  - jobber_quote_id (v1.1)                 │
│  - working_days, travel_fee, misc_fee     │
│  - formula1_total .. formula5_total       │
│  - selected_min, selected_max             │
│  - subtotal, final_total                  │
│  - pricing_settings_snapshot (JSONB)      │
│  - created_by, created_at                 │
│  - updated_by, updated_at                 │
└──────────────────┬───────────────────────┘
                   │ 1:N
                   ▼
       ┌────────────────────────┐
       │     quote_items        │
       │  - id (uuid)           │
       │  - quote_id (FK)       │
       │  - product_id (FK, null│
       │     if custom)         │
       │  - product_name_snapshot │
       │  - market_price_snapshot │
       │  - actual_price_snapshot │
       │  - quantity            │
       │  - is_custom (bool)    │
       │  - position (sort)     │
       └────────────────────────┘
                    ▲
                    │ N:1 (nullable)
                    │
         ┌──────────────────────┐
         │     products         │
         │  (페인트 마스터 DB)  │
         │  - id (uuid)         │
         │  - name              │
         │  - manufacturer      │
         │  - type              │
         │  - unit              │
         │  - market_price      │
         │  - actual_price      │
         │  - color_code        │
         │  - active            │
         └──────────────────────┘
```

---

## DDL (`supabase/migrations/0001_initial_schema.sql`)

```sql
-- 페인트 마스터
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  manufacturer    TEXT,
  type            TEXT,
  unit            TEXT NOT NULL DEFAULT 'gallon',
  market_price    NUMERIC(10,2) NOT NULL CHECK (market_price >= 0),
  actual_price    NUMERIC(10,2) NOT NULL CHECK (actual_price >= 0),
  color_code      TEXT,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_name_search
  ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_active ON products(active) WHERE active = true;

-- 가격 설정 (singleton)
CREATE TABLE pricing_settings (
  id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  f1_labour_rate  NUMERIC(10,2) NOT NULL DEFAULT 500 CHECK (f1_labour_rate >= 0),
  f2_labour_rate  NUMERIC(10,2) NOT NULL DEFAULT 460 CHECK (f2_labour_rate >= 0),
  f3_labour_rate  NUMERIC(10,2) NOT NULL DEFAULT 460 CHECK (f3_labour_rate >= 0),
  f4_labour_rate  NUMERIC(10,2) NOT NULL DEFAULT 380 CHECK (f4_labour_rate >= 0),
  f5_labour_rate  NUMERIC(10,2) NOT NULL DEFAULT 380 CHECK (f5_labour_rate >= 0),
  f2_margin       NUMERIC(4,3)  NOT NULL DEFAULT 0.30 CHECK (f2_margin >= 0),
  f3_margin       NUMERIC(4,3)  NOT NULL DEFAULT 0.30 CHECK (f3_margin >= 0),
  f4_margin       NUMERIC(4,3)  NOT NULL DEFAULT 0.25 CHECK (f4_margin >= 0),
  f5_margin       NUMERIC(4,3)  NOT NULL DEFAULT 0.30 CHECK (f5_margin >= 0),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      UUID REFERENCES auth.users(id)
);
INSERT INTO pricing_settings (id) VALUES (1); -- 초기 row

-- 견적 메인
CREATE TABLE quotes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name             TEXT,
  customer_address          TEXT,
  jobber_quote_id           TEXT,
  area_sqft                 INT CHECK (area_sqft >= 0),
  work_type                 TEXT,
  working_days              NUMERIC(5,2) NOT NULL CHECK (working_days >= 0),
  travel_fee                NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (travel_fee >= 0),
  misc_fee                  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (misc_fee >= 0),
  formula1_total            NUMERIC(10,2) NOT NULL,
  formula2_total            NUMERIC(10,2) NOT NULL,
  formula3_total            NUMERIC(10,2) NOT NULL,
  formula4_total            NUMERIC(10,2) NOT NULL,
  formula5_total            NUMERIC(10,2) NOT NULL,
  selected_min              INT NOT NULL CHECK (selected_min BETWEEN 1 AND 5),
  selected_max              INT NOT NULL CHECK (selected_max BETWEEN 1 AND 5),
  subtotal                  NUMERIC(10,2) NOT NULL,
  final_total               NUMERIC(10,2) NOT NULL,
  pricing_settings_snapshot JSONB NOT NULL,
  created_by                UUID NOT NULL REFERENCES auth.users(id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by                UUID REFERENCES auth.users(id),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_customer_search
  ON quotes USING gin(to_tsvector('english', coalesce(customer_name, '')));
CREATE INDEX idx_quotes_jobber_id ON quotes(jobber_quote_id) WHERE jobber_quote_id IS NOT NULL;

-- 견적 항목 (자재 라인)
CREATE TABLE quote_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id                UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id              UUID REFERENCES products(id),
  product_name_snapshot   TEXT NOT NULL,
  market_price_snapshot   NUMERIC(10,2) NOT NULL CHECK (market_price_snapshot >= 0),
  actual_price_snapshot   NUMERIC(10,2) NOT NULL CHECK (actual_price_snapshot >= 0),
  quantity                NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  is_custom               BOOLEAN NOT NULL DEFAULT false,
  position                INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
```

---

## RLS 정책 (`supabase/migrations/0002_rls_policies.sql`)

```sql
-- 모든 테이블 RLS 켜기
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items       ENABLE ROW LEVEL SECURITY;

-- v1.0 정책: 인증 사용자 = read/write 전부, 미인증 = 거부
CREATE POLICY "authenticated_all" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON pricing_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON quotes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON quote_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 미인증 사용자는 모든 테이블 접근 불가 (정책 없음 = 거부)
```

---

## 스냅샷 컬럼 규칙

- `quote_items.market_price_snapshot`, `actual_price_snapshot`: 저장 시 `products` 가격 복사
- `quotes.pricing_settings_snapshot` (JSONB): 저장 시 `pricing_settings` 전체 복사
- **목적:** 가격·설정 변경이 과거 견적 재조회 결과를 바꾸지 않게 함
- 자세한 결정 배경: `docs/DECISIONS.md` #6

---

## 보안 모델 요약

| 영역 | 정책 |
|---|---|
| 인증 | Supabase Auth, 세션 7일 |
| 인가 | RLS — 모든 테이블, v1.0 동일 권한 |
| 민감 정보 | `actual_price`는 RLS 보호, 로그 출력 금지 |

전체 보안 규칙: `docs/SECURITY.md`.
