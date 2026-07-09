# けいかくん Frontend

Next.js App Router で実装された、けいかくんのフロントエンドです。認証、MFA、利用者管理、支援計画、PDF成果物、通知、課金、事業所管理、app_admin 管理画面を提供します。

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI primitives and local UI components
- React Hook Form
- Zod
- lucide-react / react-icons / Heroicons
- react-dropzone
- qrcode.react
- Sonner
- Playwright

API 通信は `lib/http.ts` と `lib/api/*` に集約しています。

## 開発コマンド

```bash
npm install
npm run dev
npm run lint
npm run build
```

E2E テスト:

```bash
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:report
```

## 環境変数

代表的な値です。

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

## ディレクトリ構成

```text
app/
├── (protected)/       # login required screens
├── auth/              # login, signup, MFA, email verification
├── privacy/
├── terms/
└── page.tsx

components/
├── auth/
├── common/
├── messages/
├── notice/
├── protected/
└── ui/

lib/
├── api/               # endpoint-specific adapters
├── http.ts            # shared fetch wrapper
├── dal.ts             # server-side session and role helpers
└── permissions/

hooks/
types/
e2e/
```

## 主要ルート

認証:

- `/auth/login`
- `/auth/signup`
- `/auth/admin/login`
- `/auth/admin/signup`
- `/auth/admin/office_setup`
- `/auth/app-admin/login`
- `/auth/mfa-first-setup`
- `/auth/mfa-setup`
- `/auth/mfa-verify`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/auth/verify-email-change`
- `/auth/select-office`

保護画面:

- `/dashboard`
- `/recipients`
- `/recipients/new`
- `/recipients/[id]`
- `/support_plan/[id]`
- `/pdf-list`
- `/calendar/events`
- `/notice`
- `/notice/[id]`
- `/messages/new`
- `/profile`
- `/admin`
- `/app-admin`

公開ページ:

- `/`
- `/terms`
- `/privacy`
- `/act-on-specified-commercial-transactions`

## ロールと画面制御

- `owner`: 事業所管理、スタッフ管理、課金、主要操作を行います。
- `manager`: 利用者や支援計画の通常管理を行います。
- `employee`: 参照と一部操作申請を行います。
- `app_admin`: アプリ運営者向けの管理画面を使います。

ロール判定は `lib/dal.ts`、`hooks/useStaffRole.ts`、各 protected page の server-side guard で扱います。

## UI と API 実装方針

- 共通 UI は `components/ui` と `components/common` に置きます。
- 画面固有 UI は `components/protected/*` や機能別ディレクトリに置きます。
- API 呼び出しは `lib/api/*` に追加し、画面から直接 fetch URL を組み立てないようにします。
- 認証 Cookie と CSRF の扱いは `lib/http.ts` の共通処理に寄せます。
- 本番コードに無条件の `console.log` を残しません。

## 課金表示

Stripe の現行サブスクリプション価格は月額6,000円です。表示金額を変更する場合は Stripe 側の Price、バックエンドの `STRIPE_PRICE_ID`、フロントエンドの表示文言を同時に確認します。

## デプロイ

Vercel で配信する Next.js アプリです。production API の接続先は `NEXT_PUBLIC_API_URL` で指定します。
