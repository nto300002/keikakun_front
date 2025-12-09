'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface InquiryReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiryId: string;
  inquiryTitle: string;
  senderEmail: string | null;
  onSuccess?: () => void;
}

export default function InquiryReplyModal({
  isOpen,
  onClose,
  inquiryTitle,
  senderEmail,
  onSuccess,
}: InquiryReplyModalProps) {
  const [replyContent, setReplyContent] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      setError('返信内容を入力してください');
      return;
    }

    if (replyContent.length > 20000) {
      setError('返信内容は20,000文字以内で入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: APIエンドポイントを実装後に接続
      // await inquiryApi.replyToInquiry(inquiryId, {
      //   body: replyContent,
      //   send_email: sendEmail,
      // });

      // 仮の実装: 2秒待機
      await new Promise((resolve) => setTimeout(resolve, 2000));

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('返信の送信に失敗しました:', err);
      setError('返信の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReplyContent('');
    setSendEmail(false);
    setError(null);
    onClose();
  };

  // テンプレート例
  const templates = [
    {
      label: 'お問い合わせありがとうございます',
      content: `お問い合わせいただきありがとうございます。

ご連絡いただいた件について確認いたしました。

`,
    },
    {
      label: '調査中',
      content: `お問い合わせいただきありがとうございます。

現在、ご報告いただいた内容について調査を進めております。
詳細が分かり次第、改めてご連絡させていただきます。

今しばらくお待ちいただけますようお願いいたします。`,
    },
    {
      label: '解決済み',
      content: `お問い合わせいただきありがとうございました。

ご報告いただいた問題は解決いたしました。
ご不便をおかけして申し訳ございませんでした。

引き続きよろしくお願いいたします。`,
    },
  ];

  const applyTemplate = (content: string) => {
    setReplyContent(content);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="返信を作成" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 問い合わせ情報 */}
        <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">返信先の問い合わせ</h3>
          <p className="text-white font-medium">{inquiryTitle}</p>
          {senderEmail && (
            <p className="text-sm text-gray-400 mt-1">送信先: {senderEmail}</p>
          )}
        </div>

        {/* テンプレート選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            テンプレート（任意）
          </label>
          <div className="flex flex-wrap gap-2">
            {templates.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyTemplate(template.content)}
                className="px-3 py-1 bg-[#2a3441] text-gray-300 rounded hover:bg-[#3a4451] transition-colors text-sm"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* 返信内容 */}
        <div>
          <label htmlFor="reply_content" className="block text-sm font-medium text-gray-300 mb-2">
            返信内容（必須）<span className="text-red-400 ml-1">*</span>
          </label>
          <textarea
            id="reply_content"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className={`w-full bg-[#1a2332] border ${
              error && !replyContent.trim() ? 'border-red-500' : 'border-[#2a3441]'
            } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
            placeholder="返信内容を入力してください..."
            rows={10}
            maxLength={20000}
          />
          <div className="flex justify-between mt-1">
            <div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            <p className="text-xs text-gray-500">{replyContent.length}/20,000</p>
          </div>
        </div>

        {/* メール送信オプション */}
        {senderEmail && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <p className="text-white font-medium">メールで送信する</p>
                <p className="text-sm text-gray-400 mt-1">
                  チェックを入れると、登録されたメールアドレスに返信が送信されます。
                  チェックを外すと、内部通知のみで返信されます。
                </p>
              </div>
            </label>
          </div>
        )}

        {/* プレビュー */}
        {replyContent && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">プレビュー</h3>
            <div className="bg-[#1a2332] border border-[#2a3441] rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{replyContent}</p>
            </div>
          </div>
        )}

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 bg-[#2a3441] text-gray-300 rounded-lg hover:bg-[#3a4451] transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !replyContent.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : sendEmail ? 'メールで返信' : '返信を送信'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
