'use client';

import { useState, useEffect, useCallback } from 'react';
import { InquiryFullResponse, InquiryStatus, InquiryPriority } from '@/types/inquiry';
import { inquiryApi } from '@/lib/api/inquiry';
import { FaArrowLeft, FaReply, FaUser, FaEnvelope, FaGlobe, FaDesktop } from 'react-icons/fa';

interface InquiryDetailProps {
  inquiryId: string;
  onBack: () => void;
  onOpenReply: (inquiryId: string) => void;
}

export default function InquiryDetail({ inquiryId, onBack, onOpenReply }: InquiryDetailProps) {
  const [inquiry, setInquiry] = useState<InquiryFullResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInquiryDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inquiryApi.getInquiry(inquiryId);
      setInquiry(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '問い合わせの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    fetchInquiryDetail();
  }, [fetchInquiryDetail]);

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (!inquiry) return;

    setIsUpdating(true);
    try {
      await inquiryApi.updateInquiry(inquiryId, { status: newStatus });
      setInquiry({
        ...inquiry,
        inquiry_detail: {
          ...inquiry.inquiry_detail,
          status: newStatus,
        },
      });
    } catch (err) {
      console.error('ステータスの更新に失敗しました:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: InquiryPriority) => {
    if (!inquiry) return;

    setIsUpdating(true);
    try {
      await inquiryApi.updateInquiry(inquiryId, { priority: newPriority });
      setInquiry({
        ...inquiry,
        inquiry_detail: {
          ...inquiry.inquiry_detail,
          priority: newPriority,
        },
      });
    } catch (err) {
      console.error('優先度の更新に失敗しました:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
        <p className="text-gray-400 mt-4">読み込み中...</p>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">{error || '問い合わせが見つかりませんでした'}</p>
        <button
          onClick={onBack}
          className="mt-4 text-purple-400 hover:text-purple-300 flex items-center gap-2"
        >
          <FaArrowLeft />
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
        >
          <FaArrowLeft />
          一覧に戻る
        </button>
        <h2 className="text-2xl font-bold text-white">{inquiry.message.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 問い合わせ内容 */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">問い合わせ内容</h3>
              <span className="text-sm text-gray-400">{formatDate(inquiry.message.created_at)}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{inquiry.message.content}</p>
            </div>
          </div>

          {/* 返信履歴 */}
          {inquiry.reply_history && inquiry.reply_history.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">返信履歴</h3>
              <div className="space-y-4">
                {inquiry.reply_history.map((reply) => (
                  <div key={reply.id} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-purple-400">{reply.sender_name}</span>
                      <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 管理者メモ */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">管理者メモ</h3>
            <textarea
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
              placeholder="この問い合わせに関するメモを記入..."
              defaultValue={inquiry.inquiry_detail.admin_notes || ''}
            />
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* アクション */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">アクション</h3>
            <button
              onClick={() => onOpenReply(inquiryId)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors mb-3"
            >
              <FaReply />
              返信する
            </button>
          </div>

          {/* ステータス・優先度 */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">管理情報</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ステータス</label>
                <select
                  value={inquiry.inquiry_detail.status}
                  onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
                  disabled={isUpdating}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="new">新規</option>
                  <option value="open">確認済み</option>
                  <option value="in_progress">対応中</option>
                  <option value="answered">回答済み</option>
                  <option value="closed">クローズ</option>
                  <option value="spam">スパム</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">優先度</label>
                <select
                  value={inquiry.inquiry_detail.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as InquiryPriority)}
                  disabled={isUpdating}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">低</option>
                  <option value="normal">通常</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
          </div>

          {/* 送信者情報 */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">送信者情報</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <FaUser className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400">名前</p>
                  <p className="text-white">{inquiry.inquiry_detail.sender_name || '未設定'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaEnvelope className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400">メールアドレス</p>
                  <p className="text-white">{inquiry.inquiry_detail.sender_email || '未設定'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaGlobe className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400">IPアドレス</p>
                  <p className="text-white font-mono text-xs">
                    {inquiry.inquiry_detail.ip_address || '不明'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaDesktop className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-400">User-Agent</p>
                  <p className="text-white text-xs break-all">
                    {inquiry.inquiry_detail.user_agent || '不明'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
