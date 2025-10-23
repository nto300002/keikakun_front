'use client';

import { useState } from 'react';
import { assessmentApi, type IssueAnalysis, type IssueAnalysisInput } from '@/lib/assessment';

interface IssueAnalysisFormProps {
  recipientId: string;
  issueAnalysis?: IssueAnalysis;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IssueAnalysisForm({
  recipientId,
  issueAnalysis,
  onSuccess,
  onCancel,
}: IssueAnalysisFormProps) {
  const [formData, setFormData] = useState<IssueAnalysisInput>({
    what_i_like_to_do: issueAnalysis?.what_i_like_to_do || '',
    im_not_good_at: issueAnalysis?.im_not_good_at || '',
    the_life_i_want: issueAnalysis?.the_life_i_want || '',
    the_support_i_want: issueAnalysis?.the_support_i_want || '',
    points_to_keep_in_mind_when_providing_support: issueAnalysis?.points_to_keep_in_mind_when_providing_support || '',
    future_dreams: issueAnalysis?.future_dreams || '',
    other: issueAnalysis?.other || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await assessmentApi.issueAnalysis.createOrUpdate(recipientId, formData);
      onSuccess();
    } catch (err) {
      console.error('Failed to save issue analysis:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('課題分析の保存に失敗しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          好き、得意なこと
        </label>
        <textarea
          value={formData.what_i_like_to_do}
          onChange={(e) => setFormData({ ...formData, what_i_like_to_do: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="好きなことや得意なことを入力してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          嫌い、苦手なこと
        </label>
        <textarea
          value={formData.im_not_good_at}
          onChange={(e) => setFormData({ ...formData, im_not_good_at: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="嫌いなことや苦手なことを入力してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          私の望む生活
        </label>
        <textarea
          value={formData.the_life_i_want}
          onChange={(e) => setFormData({ ...formData, the_life_i_want: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="望む生活について入力してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          特に支援してほしいこと
        </label>
        <textarea
          value={formData.the_support_i_want}
          onChange={(e) => setFormData({ ...formData, the_support_i_want: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="特に支援してほしいことを入力してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          支援する時に気をつけてほしいこと
        </label>
        <textarea
          value={formData.points_to_keep_in_mind_when_providing_support}
          onChange={(e) => setFormData({ ...formData, points_to_keep_in_mind_when_providing_support: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="支援時に気をつけてほしいことを入力してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          将来の夢や希望
        </label>
        <textarea
          value={formData.future_dreams}
          onChange={(e) => setFormData({ ...formData, future_dreams: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="将来の夢や希望を入力してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          その他
        </label>
        <textarea
          value={formData.other}
          onChange={(e) => setFormData({ ...formData, other: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="その他の情報を入力してください"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#10b981] hover:bg-[#0ea571] disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          )}
          {issueAnalysis ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );
}
