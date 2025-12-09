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
  const [sendEmail, setSendEmail] = useState(false);
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
        send_email: sendEmail,
      });

      console.log('✅ [InquiryReplyModal] 返信送信成功:', response.message);
      toast.success(response.message || '返信を送信しました');

      // 成功時にコールバックを実行してモーダルを閉じる
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ [InquiryReplyModal] 返信送信失敗:', error);
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
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">問い合わせに返信</h3>

        {/* 問い合わせ情報 */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm text-gray-400 w-20 flex-shrink-0">件名:</span>
              <span className="text-white font-medium">{inquiryTitle}</span>
            </div>
            {senderEmail && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 w-20 flex-shrink-0">送信先:</span>
                <span className="text-white">{senderEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* 返信内容入力 */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm block mb-2">
            返信内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={10}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="返信内容を入力してください..."
            maxLength={20000}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
          />
          <p className="text-gray-400 text-xs mt-1">
            {replyContent.length} / 20,000文字
          </p>
        </div>

        {/* メール送信オプション */}
        {senderEmail && (
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
              />
              <div className="flex-1">
                <span className="text-white font-medium">メールで返信を送信</span>
                <p className="text-gray-400 text-sm mt-1">
                  チェックを入れると、送信者のメールアドレスに返信が送信されます。
                  チェックを外すと、内部通知のみが送信されます。
                </p>
              </div>
            </label>
          </div>
        )}

        {/* 注意事項 */}
        {!senderEmail && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 mb-6">
            <p className="text-yellow-200 text-sm">
              ⚠️ 送信者のメールアドレスが未設定のため、内部通知として送信されます。
            </p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
