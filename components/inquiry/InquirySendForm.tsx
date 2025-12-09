'use client';

import { useState } from 'react';
import { InquiryCategory, InquiryCreateRequest } from '@/types/inquiry';
import { inquiryApi } from '@/lib/api/inquiry';

export default function InquirySendForm() {
  const [formData, setFormData] = useState<Omit<InquiryCreateRequest, 'sender_name' | 'sender_email'>>({
    title: '',
    content: '',
    category: '質問',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '件名を入力してください';
    } else if (formData.title.length > 200) {
      newErrors.title = '件名は200文字以内で入力してください';
    }

    if (!formData.content.trim()) {
      newErrors.content = '内容を入力してください';
    } else if (formData.content.length > 20000) {
      newErrors.content = '内容は20,000文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // ログイン済みユーザーなので sender_name, sender_email は不要
      await inquiryApi.createInquiry(formData as InquiryCreateRequest);

      setSubmitSuccess(true);
      setFormData({
        title: '',
        content: '',
        category: '質問',
      });
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('問い合わせの送信に失敗しました:', error);
      setErrors({ submit: '送信に失敗しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">お問い合わせ送信</h2>
          <p className="text-gray-400">
            アプリ管理者へ問い合わせを送信できます。お名前とメールアドレスは自動で設定されます。
          </p>
        </div>

        {submitSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 font-medium">✓ 問い合わせを送信しました</p>
            <p className="text-green-400/80 text-sm mt-1">
              後ほど管理者より回答がある場合、内部通知でお知らせします。
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 問い合わせ種別 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              問い合わせ種別
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as InquiryCategory })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="質問">質問</option>
              <option value="不具合">不具合報告</option>
              <option value="その他">その他</option>
            </select>
          </div>

          {/* 件名 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              件名（必須）<span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full bg-gray-700 border ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="件名を入力してください"
              maxLength={200}
            />
            <div className="flex justify-between mt-1">
              <div>
                {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
              </div>
              <p className="text-xs text-gray-500">{formData.title.length}/200</p>
            </div>
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              内容（必須）<span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className={`w-full bg-gray-700 border ${
                errors.content ? 'border-red-500' : 'border-gray-600'
              } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              placeholder="お問い合わせ内容を詳しくご記入ください"
              rows={8}
              maxLength={20000}
            />
            <div className="flex justify-between mt-1">
              <div>
                {errors.content && <p className="text-sm text-red-400">{errors.content}</p>}
              </div>
              <p className="text-xs text-gray-500">{formData.content.length}/20,000</p>
            </div>
          </div>

          {/* エラーメッセージ */}
          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
