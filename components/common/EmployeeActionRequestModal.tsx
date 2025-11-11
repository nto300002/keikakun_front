'use client';

import { useState } from 'react';
import { employeeActionRequestsApi } from '@/lib/api/employeeActionRequests';
import { ActionType, ResourceType } from '@/types/employeeActionRequest';

interface EmployeeActionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actionType: ActionType;
  resourceType: ResourceType;
  resourceId?: number | string;
  requestData: Record<string, unknown>;
  actionDescription: string;
}

/**
 * Employee権限のユーザーが重要な操作を行う際に表示される
 * リクエスト申請確認モーダル
 */
export default function EmployeeActionRequestModal({
  isOpen,
  onClose,
  onSuccess,
  actionType,
  resourceType,
  resourceId,
  requestData,
  actionDescription,
}: EmployeeActionRequestModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // リクエストデータにメモを追加
      const payload = {
        resource_type: resourceType,
        action_type: actionType,
        resource_id: resourceId,
        request_data: {
          ...requestData,
          request_notes: notes || undefined,
        },
      };

      await employeeActionRequestsApi.createRequest(payload);

      // 成功時
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      setNotes('');
    } catch (err) {
      console.error('Failed to create employee action request:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('リクエストの送信に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[#1a1f2e] border border-[#2a3441] rounded-xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a3441]">
          <div>
            <h3 className="text-lg font-semibold text-white">承認リクエスト</h3>
            <p className="text-sm text-[#9ca3af] mt-1">マネージャー/オーナーの承認が必要です</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition-colors text-2xl disabled:opacity-50"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-4">
          {/* アクション説明 */}
          <div className="bg-[#0f1419] border border-[#2a3441] rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">実行する操作</p>
            <p className="text-white font-medium">{actionDescription}</p>
          </div>

          { /* リクエスト理由 */ }
          {/* 
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              リクエスト理由（任意）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="この操作が必要な理由を記入してください（任意）"
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              disabled={isSubmitting}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {notes.length}/500文字
            </div>
          </div> */}

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              💡 このリクエストはマネージャー/オーナーが承認した後に実行されます。承認状況は通知で確認できます。
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#2a3441]">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#10b981] hover:bg-[#0f9f6e] text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            )}
            {isSubmitting ? '送信中...' : 'リクエスト送信'}
          </button>
        </div>
      </div>
    </div>
  );
}
