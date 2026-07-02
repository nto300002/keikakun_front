'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast-debug';
import { inquiryApi } from '@/lib/api/inquiry';
import type { InquiryCategory } from '@/types/inquiry';

export default function FeedbackForm() {
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<InquiryCategory>('その他');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackTitle.trim()) {
      toast.error('件名を入力してください');
      return;
    }

    if (!feedbackContent.trim()) {
      toast.error('フィードバック内容を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await inquiryApi.createInquiry({
        title: feedbackTitle,
        content: feedbackContent,
        category: feedbackCategory,
      });

      toast.success(response.message || 'フィードバックを送信しました。ご協力ありがとうございます。');
      setFeedbackTitle('');
      setFeedbackContent('');
      setFeedbackCategory('その他');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message || 'フィードバックの送信に失敗しました。しばらく時間をおいてからお試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-7">不具合・ご要望</h2>

      <div className="bg-white border border-slate-300 shadow-sm dark:bg-[#1a1a2e] dark:border-[#2a2a3e] rounded-xl p-6">
        <div className="mb-7 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">アプリ運営者へのフィードバック</h3>
              <p className="text-blue-700 dark:text-blue-200 text-base leading-relaxed">
                このフォームは、アプリの運営者に直接フィードバックを送信するためのものです。<br />
                ご意見・ご要望・不具合報告など、お気軽にお送りください。
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">カテゴリ</label>
            <select
              value={feedbackCategory}
              onChange={(e) => setFeedbackCategory(e.target.value as InquiryCategory)}
              className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-lg text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="不具合">不具合報告</option>
              <option value="質問">質問</option>
              <option value="その他">その他（ご意見・ご要望）</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">
              件名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={feedbackTitle}
              onChange={(e) => setFeedbackTitle(e.target.value)}
              placeholder="例: ログイン画面で不具合があります"
              maxLength={200}
              className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-lg text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white placeholder-slate-500 dark:placeholder-[#666] focus:outline-none focus:border-blue-500"
            />
            <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
              {feedbackTitle.length} / 200文字
            </p>
          </div>

          <div>
            <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">
              内容 <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={8}
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="フィードバック内容を入力してください...&#10;&#10;【不具合報告の場合】&#10;・発生した状況&#10;・エラーメッセージ&#10;・再現手順&#10;などを記載いただけると助かります。"
              maxLength={20000}
              className="w-full bg-white border border-slate-300 rounded-lg px-5 py-4 text-lg text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white placeholder-slate-500 dark:placeholder-[#666] focus:outline-none focus:border-blue-500 resize-none"
            />
            <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
              {feedbackContent.length} / 20,000文字
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleFeedbackSubmit}
              disabled={isSubmitting || !feedbackTitle.trim() || !feedbackContent.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '送信中...' : '運営者に送信'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
