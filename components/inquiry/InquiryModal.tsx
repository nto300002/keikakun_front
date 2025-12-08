'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { InquiryCategory, InquiryCreateRequest } from '@/types/inquiry';
import { inquiryApi } from '@/lib/api/inquiry';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [formData, setFormData] = useState<InquiryCreateRequest>({
    title: '',
    content: '',
    category: '質問',
    sender_name: '',
    sender_email: '',
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

    // sender_email は undefined になり得るため、安全に扱う
    const email = formData.sender_email ?? '';
    if (!email.trim()) {
      newErrors.sender_email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.sender_email = '有効なメールアドレスを入力してください';
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
      await inquiryApi.createInquiry(formData);

      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('問い合わせの送信に失敗しました:', error);
      setErrors({ submit: '送信に失敗しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      category: '質問',
      sender_name: '',
      sender_email: '',
    });
    setErrors({});
    setSubmitSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="お問い合わせ" size="lg">
      {submitSuccess ? (
        <div className="text-center py-8">
          <div className="mb-4 text-green-400 text-5xl">✓</div>
          <h3 className="text-xl font-semibold text-white mb-2">送信が完了しました</h3>
          <p className="text-gray-400">お問い合わせありがとうございます。</p>
          <p className="text-gray-400">後ほど担当者よりご連絡いたします。</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* お名前（任意） */}
          <div>
            <label htmlFor="sender_name" className="block text-sm font-medium text-gray-300 mb-2">
              お名前（任意）
            </label>
            <input
              type="text"
              id="sender_name"
              value={formData.sender_name}
              onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
              className="w-full bg-[#1a2332] border border-[#2a3441] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田太郎"
            />
          </div>

          {/* メールアドレス（必須） */}
          <div>
            <label htmlFor="sender_email" className="block text-sm font-medium text-gray-300 mb-2">
              メールアドレス（必須）<span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="email"
              id="sender_email"
              value={formData.sender_email ?? ''}
              onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
              className={`w-full bg-[#1a2332] border ${
                errors.sender_email ? 'border-red-500' : 'border-[#2a3441]'
              } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="example@example.com"
            />
            {errors.sender_email && (
              <p className="mt-1 text-sm text-red-400">{errors.sender_email}</p>
            )}
          </div>

          {/* 問い合わせ種別 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              問い合わせ種別
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as InquiryCategory })}
              className="w-full bg-[#1a2332] border border-[#2a3441] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className={`w-full bg-[#1a2332] border ${
                errors.title ? 'border-red-500' : 'border-[#2a3441]'
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
              className={`w-full bg-[#1a2332] border ${
                errors.content ? 'border-red-500' : 'border-[#2a3441]'
              } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              placeholder="お問い合わせ内容を詳しくご記入ください"
              rows={6}
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
