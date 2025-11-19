# MFA管理API使用例

## 概要

管理者（owner権限）がスタッフのMFA（多要素認証）を有効化・無効化するためのAPIクライアントです。

## インポート

```typescript
import { mfaApi } from '@/lib/api/mfa';
```

## APIメソッド

### 1. スタッフのMFAを有効化

```typescript
adminEnableStaffMfa(staffId: string): Promise<MfaEnableResponse>
```

**パラメータ:**
- `staffId`: 対象スタッフのUUID

**レスポンス:**
```typescript
{
  message: "多要素認証を有効にしました"
}
```

**例外:**
- `401 Unauthorized`: 認証されていない
- `403 Forbidden`: 管理者権限がない
- `404 Not Found`: スタッフが見つからない
- `400 Bad Request`: 既にMFAが有効

### 2. スタッフのMFAを無効化

```typescript
adminDisableStaffMfa(staffId: string): Promise<MfaDisableResponse>
```

**パラメータ:**
- `staffId`: 対象スタッフのUUID

**レスポンス:**
```typescript
{
  message: "多要素認証を無効にしました"
}
```

**例外:**
- `401 Unauthorized`: 認証されていない
- `403 Forbidden`: 管理者権限がない
- `404 Not Found`: スタッフが見つからない
- `400 Bad Request`: 既にMFAが無効

## 使用例

### React コンポーネントでの使用例

```typescript
import { useState } from 'react';
import { mfaApi } from '@/lib/api/mfa';

function StaffMfaToggle({ staffId, isMfaEnabled }: { staffId: string; isMfaEnabled: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleMfa = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isMfaEnabled) {
        // MFAを無効化
        const response = await mfaApi.adminDisableStaffMfa(staffId);
        alert(response.message);
      } else {
        // MFAを有効化
        const response = await mfaApi.adminEnableStaffMfa(staffId);
        alert(response.message);
      }

      // 成功後、スタッフ情報を再取得する処理
      // refreshStaffList();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('MFA設定の変更に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggleMfa}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? '処理中...' : isMfaEnabled ? 'MFAを無効化' : 'MFAを有効化'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
```

### スタッフ一覧画面での使用例

```typescript
import { mfaApi } from '@/lib/api/mfa';
import { StaffResponse } from '@/types/staff';

async function handleMfaToggle(staff: StaffResponse) {
  const confirmMessage = staff.is_mfa_enabled
    ? `${staff.full_name}さんのMFAを無効化しますか？`
    : `${staff.full_name}さんのMFAを有効化しますか？`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const response = staff.is_mfa_enabled
      ? await mfaApi.adminDisableStaffMfa(staff.id)
      : await mfaApi.adminEnableStaffMfa(staff.id);

    alert(response.message);

    // スタッフ一覧を再取得
    // await fetchStaffList();
  } catch (error) {
    if (error instanceof Error) {
      alert(`エラー: ${error.message}`);
    }
  }
}
```

### Next.js Server Actionsでの使用例（オプション）

```typescript
'use server';

import { mfaApi } from '@/lib/api/mfa';
import { revalidatePath } from 'next/cache';

export async function toggleStaffMfa(staffId: string, currentMfaStatus: boolean) {
  try {
    const response = currentMfaStatus
      ? await mfaApi.adminDisableStaffMfa(staffId)
      : await mfaApi.adminEnableStaffMfa(staffId);

    // キャッシュを無効化してページを再検証
    revalidatePath('/admin/staff');

    return { success: true, message: response.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'MFA設定の変更に失敗しました',
    };
  }
}
```

## エラーハンドリング

APIはエラーが発生した場合、Errorオブジェクトをthrowします。

```typescript
try {
  await mfaApi.adminEnableStaffMfa(staffId);
} catch (error) {
  if (error instanceof Error) {
    // エラーメッセージは日本語で返される
    console.error('エラー:', error.message);

    // エラーメッセージの例:
    // - "スタッフが見つかりません"
    // - "多要素認証は既に有効になっています"
    // - "事業所管理者の権限が必要です"
  }
}
```

## セキュリティ

- 管理者（owner）権限が必要です
- Cookie認証が自動的に適用されます（`credentials: 'include'`）
- 401エラーの場合、自動的にログアウトしてログイン画面にリダイレクトされます

## バックエンドエンドポイント

- `POST /api/v1/auth/admin/staff/{staff_id}/mfa/enable` - MFA有効化
- `POST /api/v1/auth/admin/staff/{staff_id}/mfa/disable` - MFA無効化
