'use client';

import { useState } from 'react';
import { withdrawalRequestsApi } from '@/lib/api/withdrawalRequests';
import { FaExclamationTriangle } from 'react-icons/fa';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  officeName: string;
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  onSuccess,
  officeName,
}: WithdrawalModalProps) {
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !reason.trim()) {
      setError('タイトルと退会理由を入力してください');
      return;
    }

    if (confirmText !== '退会申請') {
      setError('確認テキストが正しくありません');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await withdrawalRequestsApi.createRequest({ title, reason });
      setTitle('');
      setReason('');
      setConfirmText('');
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '退会申請の送信に失敗しました';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setReason('');
    setConfirmText('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            <FaExclamationTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">退会申請</h3>
            <p className="text-sm text-gray-400">{officeName}</p>
          </div>
        </div>

        {/* 警告メッセージ */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm font-medium mb-2">注意事項</p>
          <ul className="text-red-300 text-sm space-y-1 list-disc list-inside">
            <li>退会申請後、アプリ管理者による承認が必要です</li>
            <li>承認されると事務所データは論理削除されます</li>
            <li>論理削除から30日後にデータは完全に削除されます</li>
            <li>所属する全スタッフもログインできなくなります</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 事業終了に伴う退会申請"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              退会理由 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="退会の理由を詳しくお知らせください..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              確認のため「退会申請」と入力してください <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="退会申請"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !reason.trim() || confirmText !== '退会申請'}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '退会を申請する'}
          </button>
        </div>
      </div>
    </div>
  );
}
