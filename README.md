# 好好記帳

好好記帳是一個以繁體中文介面設計的個人記帳 Web App。使用者可以透過 Google OAuth 登入，建立多本帳本、記錄收入與支出、追蹤預算使用比例，並用月統計圖表快速看出錢花在哪些分類。

## 功能特色

- Google OAuth 登入與 Supabase session 同步
- 多帳本管理：建立、切換、刪除帳本
- 收支紀錄：新增、編輯、刪除收入與支出
- 預算追蹤：顯示目前餘額、已用預算比例與超支狀態
- 月度統計：按月份檢視分類支出圓餅圖與明細
- 響應式介面：桌面側邊欄、手機底部導覽與浮動新增按鈕
- PWA manifest 與 app icon 設定
- Vitest 單元與元件測試

## 技術棧

- Next.js `16.2.9` App Router
- React `19.2.4`
- TypeScript strict mode
- Tailwind CSS `4`
- Supabase Auth、Database、SSR helpers
- Recharts
- lucide-react
- Vitest、Testing Library、jsdom

## 專案結構

```txt
app/
  (dashboard)/               # 需要登入後使用的主介面路由群組
    page.tsx                 # 首頁儀表板
    ledgers/page.tsx         # 帳本管理
    stats/page.tsx           # 月支出統計
    settings/page.tsx        # 使用者與資料操作
    transactions/
      new/page.tsx           # 新增交易
      [id]/edit/page.tsx     # 編輯交易
  auth/callback/route.ts     # Supabase OAuth callback
  login/page.tsx             # Google 登入頁
  manifest.ts                # PWA manifest
components/
  providers/app-provider.tsx # 全域狀態、Supabase hydration、CRUD actions
  app-shell.tsx              # 登入後版面與導覽
  transaction-form.tsx       # 新增/編輯交易表單
lib/
  auth/                      # OAuth callback、登入、session 轉換
  supabase/                  # browser/server/proxy client 與 repository
  finance.ts                 # 餘額、預算、月統計計算
  validation.ts              # 表單驗證
proxy.ts                     # Next.js 16 Proxy，用於刷新 Supabase cookies
```

## 主要路由

| Route | 說明 |
| --- | --- |
| `/login` | 登入頁，使用 Google OAuth |
| `/auth/callback` | OAuth callback route handler |
| `/` | 儀表板，顯示目前帳本餘額、預算進度、最近交易 |
| `/ledgers` | 建立、切換、刪除帳本 |
| `/transactions/new` | 新增收入或支出 |
| `/transactions/[id]/edit` | 編輯或刪除交易 |
| `/stats` | 月份支出分類統計 |
| `/settings` | 使用者資訊、重設資料、登出 |
| `/supabasetest` | Supabase 連線 smoke test 頁面 |

## 資料模型

程式目前會使用下列表格：

- `user_data`：OAuth callback 後 upsert 使用者暱稱與頭像
- `money_book`：帳本資料，包含 `name`、`how_much`、`currency_code`、`user_id`
- `transactions`：交易資料，包含帳本、金額、收支類型、分類與交易日期
- `connection_smoke_tests`：僅供 `/supabasetest` 測試連線使用

TypeScript 型別集中在 `lib/types.ts`。若調整資料庫 schema，請同步更新 `lib/types.ts`、`lib/supabase/repository.ts` 與相關測試。

### Supabase schema 參考

實際 schema 以 Supabase 專案為準。若需要重建開發資料庫，可用以下方向建立表格與 RLS policy：

```sql
create table public.user_data (
  uid uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.money_book (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  how_much numeric not null check (how_much > 0),
  currency_code text not null default 'TWD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id bigint generated always as identity primary key,
  money_book_id bigint not null references public.money_book(id) on delete cascade,
  name text not null,
  how_much numeric not null check (how_much > 0),
  transaction_type text not null check (transaction_type in ('income', 'expense')),
  category text,
  transaction_date date not null,
  created_at timestamptz not null default now(),
  update_at timestamptz
);

alter table public.user_data enable row level security;
alter table public.money_book enable row level security;
alter table public.transactions enable row level security;

create policy "Users can read own profile"
on public.user_data for select
to authenticated
using ((select auth.uid()) = uid);

create policy "Users can upsert own profile"
on public.user_data for insert
to authenticated
with check ((select auth.uid()) = uid);

create policy "Users can update own profile"
on public.user_data for update
to authenticated
using ((select auth.uid()) = uid)
with check ((select auth.uid()) = uid);

create policy "Users can manage own money books"
on public.money_book for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage transactions in own books"
on public.transactions for all
to authenticated
using (
  exists (
    select 1
    from public.money_book
    where money_book.id = transactions.money_book_id
      and money_book.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.money_book
    where money_book.id = transactions.money_book_id
      and money_book.user_id = (select auth.uid())
  )
);
```

## 環境需求

- Node.js 20 或相容版本
- npm
- Supabase project
- 已在 Supabase Auth 啟用 Google provider

## 環境變數

建立 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

注意：

- 這兩個變數會被瀏覽器端程式使用，因此必須是 Supabase publishable/anon 等級的公開 key。
- 不要把 `service_role` 或 secret key 放進任何 `NEXT_PUBLIC_` 變數。
- `.env*` 已在 `.gitignore` 中，請不要提交本機金鑰。

## Supabase Auth 設定

在 Supabase Dashboard 設定：

1. 啟用 Google OAuth provider。
2. 將開發環境 callback 加入允許清單：

```txt
http://localhost:3000/auth/callback
```

3. 若有部署正式站，也加入正式網域：

```txt
https://your-domain.example/auth/callback
```

登入流程位於：

- `app/login/page.tsx`
- `lib/auth/auth.ts`
- `app/auth/callback/route.ts`
- `lib/auth/auth-callback.ts`

## 開發指令

安裝依賴：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

開啟：

```txt
http://localhost:3000
```

執行測試：

```bash
npm run test
```

執行 lint：

```bash
npm run lint
```

建立 production build：

```bash
npm run build
```

## 開發注意事項

- 這個專案使用 Next.js 16。Next.js 相關 API、檔案慣例與文件可能和過往版本不同，請以 `node_modules/next/dist/docs/` 內的版本相符文件為準。
- `proxy.ts` 是 Next.js 16 的 Proxy，不是舊稱 Middleware。Supabase cookie refresh 由 `lib/supabase/proxy.ts` 處理。
- 全域 app state 由 `components/providers/app-provider.tsx` 管理，資料來源是 Supabase repository，不是 localStorage。
- 帳本與交易的商業邏輯集中在 `lib/finance.ts` 與 `lib/validation.ts`，修改時請補或更新測試。
- UI 文字目前以繁體中文為主，語系設定為 `zh-Hant`。
- `app/(dashboard)` 是 route group，不會出現在 URL 中。
- `/supabasetest` 是開發檢查用頁面，若要公開部署，請先確認是否需要保留。

## 測試範圍

目前測試涵蓋：

- 財務計算：餘額、預算比例、月收入支出、分類支出
- 表單驗證：帳本與交易輸入
- 空帳本狀態：儀表板與新增交易頁導向帳本建立
- Auth callback、session、repository 與 provider 行為

建議在修改資料流程、登入流程、表單驗證或財務計算後至少執行：

```bash
npm run test
npm run lint
```

## 部署

此專案可部署到 Vercel 或任何支援 Next.js 的平台。部署時請設定與本機相同的 Supabase 環境變數，並在 Supabase Auth 中加入正式網域 callback URL。
