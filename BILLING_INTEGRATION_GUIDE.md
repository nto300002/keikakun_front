# 課金機能フロントエンド統合ガイド

このガイドでは、フロントエンドで課金機能（Phase 3）を統合する方法を説明します。

## 📋 実装済みコンポーネント一覧

### 1. API クライアント
- **場所**: `lib/api/billing.ts`
- **提供機能**:
  - `getBillingStatus()`: 課金ステータス取得
  - `createCheckoutSession()`: Stripe Checkout Session作成
  - `createPortalSession()`: Stripe Customer Portal Session作成

### 2. 型定義
- **場所**: `types/billing.ts`
- **提供型**:
  - `BillingStatusResponse`: 課金ステータスレスポンス
  - `CheckoutSessionResponse`: Checkout Sessionレスポンス
  - `PortalSessionResponse`: Portal Sessionレスポンス

### 3. グローバルステート管理
- **場所**: `contexts/BillingContext.tsx`
- **提供機能**:
  - `BillingProvider`: 課金ステータスをグローバルに管理するProvider
  - `useBilling()`: 課金ステータスを取得するカスタムフック

### 4. UI コンポーネント
- **`components/billing/PastDueModal.tsx`**: 支払い遅延モーダル
- **`components/billing/PastDueModalWrapper.tsx`**: PastDueModalのラッパー
- **`components/billing/BillingProtectedButton.tsx`**: 課金ステータスに基づいてボタンを無効化
- **`components/protected/admin/PlanTab.tsx`**: 管理画面「プラン」タブ

## 🚀 使い方

### 1. グローバルステート管理の使用

`BillingProvider` は既に `ProtectedLayoutClient` に統合されているため、
認証済みユーザーのページでは自動的に課金ステータスが利用可能です。

#### 課金ステータスの取得

```tsx
'use client';

import { useBilling } from '@/contexts/BillingContext';

export default function MyComponent() {
  const { billingStatus, isLoading, error, canWrite, isPastDue } = useBilling();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div>
      <p>ステータス: {billingStatus?.billing_status}</p>
      <p>書き込み可能: {canWrite ? 'はい' : 'いいえ'}</p>
      <p>支払い遅延: {isPastDue ? 'はい' : 'いいえ'}</p>
    </div>
  );
}
```

### 2. 書き込み操作のボタン無効化

#### 方法1: `BillingProtectedButton` コンポーネントを使用

```tsx
import BillingProtectedButton from '@/components/billing/BillingProtectedButton';

export default function MyPage() {
  const handleCreateUser = () => {
    // 利用者作成処理
  };

  return (
    <BillingProtectedButton
      onClick={handleCreateUser}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
    >
      利用者を作成
    </BillingProtectedButton>
  );
}
```

#### 方法2: `useBilling()` フックで直接制御

```tsx
import { useBilling } from '@/contexts/BillingContext';

export default function MyPage() {
  const { canWrite } = useBilling();

  const handleCreateUser = () => {
    // 利用者作成処理
  };

  return (
    <button
      onClick={handleCreateUser}
      disabled={!canWrite}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      title={!canWrite ? '支払い遅延のため、この操作は無効化されています' : undefined}
    >
      利用者を作成
    </button>
  );
}
```

### 3. 支払い遅延モーダルの表示

支払い遅延モーダルは `PastDueModalWrapper` によって自動的に表示されます。
`BillingProvider` の子コンポーネントであれば、特別な設定は不要です。

既に `ProtectedLayoutClient` に統合されているため、
課金ステータスが `past_due` になると自動的にモーダルが表示されます。

#### 手動でモーダルを表示する場合

```tsx
import { useState } from 'react';
import PastDueModal from '@/components/billing/PastDueModal';

export default function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        支払い方法を更新
      </button>
      <PastDueModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
```

### 4. Stripe Checkout / Portal への誘導

#### Checkout Session作成（サブスク登録）

```tsx
import { useState } from 'react';
import { billingApi } from '@/lib/api/billing';

export default function SubscribeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { url } = await billingApi.createCheckoutSession();
      // Stripe Checkoutページへリダイレクト
      window.location.href = url;
    } catch (err) {
      console.error('エラー:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-400">{error}</div>}
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        {isLoading ? '処理中...' : 'サブスクリプションに登録'}
      </button>
    </div>
  );
}
```

#### Customer Portal Session作成（支払い方法変更・解約）

```tsx
import { useState } from 'react';
import { billingApi } from '@/lib/api/billing';

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { url } = await billingApi.createPortalSession();
      // 新しいタブでStripe Customer Portalを開く
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('エラー:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-400">{error}</div>}
      <button
        onClick={handleManageSubscription}
        disabled={isLoading}
        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
      >
        {isLoading ? '処理中...' : '支払い方法の変更・解約'}
      </button>
    </div>
  );
}
```

## 📝 実装例一覧

### 利用者作成ボタンの無効化

```tsx
// app/(protected)/users/page.tsx

'use client';

import BillingProtectedButton from '@/components/billing/BillingProtectedButton';

export default function UsersPage() {
  const handleCreateUser = () => {
    // 利用者作成処理
  };

  return (
    <div>
      <h1>利用者一覧</h1>
      <BillingProtectedButton
        onClick={handleCreateUser}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        + 新規作成
      </BillingProtectedButton>
      {/* 利用者一覧 */}
    </div>
  );
}
```

### 支援計画編集ボタンの無効化

```tsx
// app/(protected)/support-plans/[id]/page.tsx

'use client';

import { useBilling } from '@/contexts/BillingContext';

export default function SupportPlanDetailPage() {
  const { canWrite } = useBilling();

  const handleEdit = () => {
    // 編集処理
  };

  return (
    <div>
      <h1>支援計画詳細</h1>
      <button
        onClick={handleEdit}
        disabled={!canWrite}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        title={!canWrite ? '支払い遅延のため編集できません' : undefined}
      >
        編集
      </button>
      {/* 支援計画詳細 */}
    </div>
  );
}
```

### フォーム送信ボタンの無効化

```tsx
// app/(protected)/forms/new/page.tsx

'use client';

import BillingProtectedButton from '@/components/billing/BillingProtectedButton';

export default function NewFormPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信処理
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* フォームフィールド */}
      <BillingProtectedButton
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        保存
      </BillingProtectedButton>
    </form>
  );
}
```

### 削除ボタンの無効化

```tsx
// components/DeleteButton.tsx

'use client';

import { useBilling } from '@/contexts/BillingContext';

interface DeleteButtonProps {
  onDelete: () => void;
  itemName: string;
}

export default function DeleteButton({ onDelete, itemName }: DeleteButtonProps) {
  const { canWrite } = useBilling();

  const handleDelete = () => {
    if (!window.confirm(`本当に${itemName}を削除しますか？`)) {
      return;
    }
    onDelete();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={!canWrite}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      title={!canWrite ? '支払い遅延のため削除できません' : undefined}
    >
      削除
    </button>
  );
}
```

## 🎨 課金ステータスの UI 表示

### ステータスバッジ

```tsx
import { useBilling } from '@/contexts/BillingContext';
import { BillingStatus } from '@/types/enums';

export default function BillingStatusBadge() {
  const { billingStatus } = useBilling();

  if (!billingStatus) return null;

  const getStatusBadge = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.FREE:
        return { color: 'bg-gray-700 text-gray-300', label: '無料トライアル' };
      case BillingStatus.ACTIVE:
        return { color: 'bg-green-900/50 text-green-400', label: '有効' };
      case BillingStatus.PAST_DUE:
        return { color: 'bg-yellow-900/50 text-yellow-400', label: '支払い遅延' };
      case BillingStatus.CANCELED:
        return { color: 'bg-red-900/50 text-red-400', label: 'キャンセル済み' };
    }
  };

  const badge = getStatusBadge(billingStatus.billing_status);

  return (
    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${badge.color}`}>
      {badge.label}
    </span>
  );
}
```

## 🔒 セキュリティ考慮事項

### 1. フロントエンド制約の限界

フロントエンドでのボタン無効化は **UXの向上** が目的であり、
セキュリティ対策ではありません。

**重要**: バックエンド API で必ず権限チェックと課金ステータスチェックを実施してください。

### 2. バックエンドでの権限チェック

```python
# app/api/v1/endpoints/users.py (例)

from app.api import deps
from app.models.enums import BillingStatus

@router.post("/users")
async def create_user(
    db: AsyncSession = Depends(deps.get_db),
    current_user: Staff = Depends(deps.get_current_user)
):
    # 課金ステータスチェック
    billing = await crud.billing.get_by_office_id(db=db, office_id=current_user.office_id)
    if billing.billing_status in [BillingStatus.past_due, BillingStatus.canceled]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="課金ステータスが無効のため、この操作は実行できません"
        )

    # 利用者作成処理
    ...
```

## 🧪 テスト

### 課金ステータスのテスト

```tsx
// __tests__/billing/BillingProtectedButton.test.tsx

import { render, screen } from '@testing-library/react';
import BillingProtectedButton from '@/components/billing/BillingProtectedButton';
import { BillingProvider } from '@/contexts/BillingContext';
import { BillingStatus } from '@/types/enums';

// モックBillingContext
jest.mock('@/contexts/BillingContext', () => ({
  ...jest.requireActual('@/contexts/BillingContext'),
  useBilling: () => ({
    canWrite: false, // past_due または canceled
    isPastDue: true,
    billingStatus: {
      billing_status: BillingStatus.PAST_DUE,
      trial_end_date: '2025-12-31T23:59:59Z',
      next_billing_date: '2025-01-01T00:00:00Z',
      current_plan_amount: 6000,
    },
    isLoading: false,
    error: null,
    refreshBillingStatus: jest.fn(),
  }),
}));

describe('BillingProtectedButton', () => {
  it('課金ステータスが past_due の場合、ボタンが無効化される', () => {
    render(
      <BillingProtectedButton onClick={() => {}}>
        作成
      </BillingProtectedButton>
    );

    const button = screen.getByRole('button', { name: '作成' });
    expect(button).toBeDisabled();
  });
});
```

## 📚 参考資料

- [Stripe Checkout ドキュメント](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal ドキュメント](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [バックエンド課金機能実装](../../k_back/docs/billing_phase2_implementation.md)

## ❓ FAQ

### Q1: `useBilling()` が "must be used within a BillingProvider" エラーを出す

**A**: `BillingProvider` の外で `useBilling()` を呼び出しています。
`BillingProvider` は `ProtectedLayoutClient` に統合されているため、
認証済みページ内であればこのエラーは発生しません。
認証不要のページで使用している場合は、`BillingProvider` でラップしてください。

### Q2: 課金ステータスが更新されない

**A**: `BillingProvider` は10分ごとに自動更新されますが、
手動で更新したい場合は `refreshBillingStatus()` を呼び出してください。

```tsx
const { refreshBillingStatus } = useBilling();

// 手動更新
await refreshBillingStatus();
```

### Q3: Stripe Checkout から戻ってきた後の処理は?

**A**: Stripe Checkoutの `success_url` には `?success=true` パラメータが付与されます。
このパラメータをチェックして、成功メッセージを表示したり、課金ステータスを再取得したりできます。

```tsx
// app/(protected)/admin/plan/page.tsx

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBilling } from '@/contexts/BillingContext';

export default function PlanPage() {
  const searchParams = useSearchParams();
  const { refreshBillingStatus } = useBilling();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      // 成功メッセージを表示
      alert('サブスクリプション登録が完了しました！');
      // 課金ステータスを再取得
      refreshBillingStatus();
    }
  }, [searchParams, refreshBillingStatus]);

  return <div>プラン管理画面</div>;
}
```

### Q4: ボタンを無効化するだけでなく、非表示にすることはできますか?

**A**: はい、`canWrite` を使って条件付きレンダリングができます。

```tsx
const { canWrite } = useBilling();

return (
  <div>
    {canWrite && (
      <button onClick={handleCreate}>
        作成
      </button>
    )}
  </div>
);
```

---

**実装完了日**: 2025年12月12日
**最終更新**: 2025年12月12日
