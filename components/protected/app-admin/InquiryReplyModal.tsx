'use client';

import { useState } from 'react';
import { inquiryApi } from '@/lib/api/inquiry';
import { toast } from '@/lib/toast-debug';

interface InquiryReplyModalProps {
  inquiryId: string;
  inquiryTitle: string;
  senderEmail: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InquiryReplyModal({
  inquiryId,
  inquiryTitle,
  senderEmail,
  onClose,
  onSuccess,
}: InquiryReplyModalProps) {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // バリデーション
    if (!replyContent.trim()) {
      toast.error('返信内容を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await inquiryApi.replyToInquiry(inquiryId, {
        body: replyContent,
        send_email: true,
      });

      toast.success(response.message || '返信を送信しました');

      // 成功時にコールバックを実行してモーダルを閉じる
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Client operation failed');
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message || '返信の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (replyContent.trim() && !window.confirm('入力内容が破棄されますが、よろしいですか？')) {
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <h3 className="text-2xl font-bold text-slate-950 mb-4 dark:text-white">問い合わせに返信</h3>

        {/* 問い合わせ情報 */}
        <div className="bg-slate-100 rounded-lg p-4 mb-6 dark:bg-gray-700">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-base text-slate-600 w-20 flex-shrink-0 dark:text-gray-400">件名:</span>
              <span className="text-slate-950 font-semibold dark:text-white">{inquiryTitle}</span>
            </div>
            {senderEmail && (
              <div className="flex items-center gap-2">
                <span className="text-base text-slate-600 w-20 flex-shrink-0 dark:text-gray-400">送信先:</span>
                <span className="text-slate-950 dark:text-white">{senderEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* 返信内容入力 */}
        <div className="mb-6">
          <label className="text-slate-700 text-base block mb-2 dark:text-gray-300">
            返信内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={10}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="返信内容を入力してください..."
            maxLength={20000}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <p className="text-slate-500 text-base mt-1 dark:text-gray-400">
            {replyContent.length} / 20,000文字
          </p>
        </div>

        {/* メール連動 */}
        {senderEmail && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 dark:bg-blue-900/30 dark:border-blue-700/50">
            <p className="text-blue-800 text-base dark:text-blue-100">
              返信はアプリ内通知とメールの両方で送信されます。
            </p>
          </div>
        )}

        {/* 注意事項 */}
        {!senderEmail && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6 dark:bg-yellow-900/30 dark:border-yellow-700/50">
            <p className="text-yellow-800 text-base dark:text-yellow-200">
              送信者のメールアドレスが未設定のため、アプリ内通知のみ送信されます。
            </p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !replyContent.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '返信を送信'}
          </button>
        </div>
      </div>
    </div>
  );
}
