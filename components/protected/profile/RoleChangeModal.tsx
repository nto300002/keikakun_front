'use client';

import { useState } from 'react';
import { StaffRole } from '@/types/enums';
import { roleChangeRequestsApi } from '@/lib/api/roleChangeRequests';

interface RoleChangeModalProps {
  currentRole: StaffRole;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const roleLabels: Record<StaffRole, string> = {
  [StaffRole.OWNER]: '管理者',
  [StaffRole.MANAGER]: 'マネージャー',
  [StaffRole.EMPLOYEE]: '従業員',
};

export default function RoleChangeModal({
  currentRole,
  isOpen,
  onClose,
  onSuccess,
}: RoleChangeModalProps) {
  const [requestedRole, setRequestedRole] = useState<StaffRole | ''>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!requestedRole) {
      setError('変更したい権限を選択してください');
      return;
    }

    if (requestedRole === currentRole) {
      setError('現在の権限と同じです。別の権限を選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await roleChangeRequestsApi.createRequest({
        requested_role: requestedRole,
        request_notes: notes || undefined,
      });

      // 成功時
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'リクエストの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRequestedRole('');
    setNotes('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">権限変更リクエスト</h3>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* 現在の権限 */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">現在の権限</label>
            <div className="bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2">
              <p className="text-white font-medium">{roleLabels[currentRole]}</p>
            </div>
          </div>

          {/* リクエストする権限 */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">
              リクエストする権限 <span className="text-red-500">*</span>
            </label>
            <select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value as StaffRole)}
              className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">選択してください</option>
              <option value={StaffRole.EMPLOYEE}>従業員</option>
              <option value={StaffRole.MANAGER}>マネージャー</option>
              {currentRole === StaffRole.MANAGER && (
                <option value={StaffRole.OWNER}>管理者</option>
              )}
            </select>
            <p className="text-gray-500 text-xs mt-1">
              ※ 管理者への変更は、現在マネージャーの場合のみ選択できます
            </p>
          </div>

          {/* 理由（任意） */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">理由（任意）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="変更を希望する理由を入力してください..."
              className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !requestedRole}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'リクエスト送信中...' : 'リクエスト送信'}
          </button>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
