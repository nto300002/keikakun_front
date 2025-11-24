'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { messagesApi } from '@/lib/api/messages';
import { MessageDetailResponse, MessagePriority, MessageType } from '@/types/message';
import { toast } from '@/lib/toast-debug';

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params.id as string;
  const [message, setMessage] = useState<MessageDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await messagesApi.getMessageDetail(messageId);
        setMessage(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error(errorMessage || 'メッセージの取得に失敗しました');
        // エラー時は通知ページに戻る
        router.push('/notice');
      } finally {
        setIsLoading(false);
      }
    };

    if (messageId) {
      fetchMessage();
    }
  }, [messageId, router]);

  const getMessageTypeLabel = (type: MessageType) => {
    switch (type) {
      case MessageType.PERSONAL:
        return '個別メッセージ';
      case MessageType.ANNOUNCEMENT:
        return 'お知らせ';
      case MessageType.SYSTEM:
        return 'システム通知';
      case MessageType.INQUIRY:
        return 'お問い合わせ';
      default:
        return 'メッセージ';
    }
  };

  const getPriorityLabel = (priority: MessagePriority) => {
    switch (priority) {
      case MessagePriority.URGENT:
        return { label: '緊急', color: 'bg-red-600' };
      case MessagePriority.HIGH:
        return { label: '高', color: 'bg-orange-600' };
      case MessagePriority.NORMAL:
        return { label: '通常', color: 'bg-blue-600' };
      case MessagePriority.LOW:
        return { label: '低', color: 'bg-gray-600' };
      default:
        return { label: '通常', color: 'bg-blue-600' };
    }
  };

  const getPriorityIcon = (priority: MessagePriority) => {
    switch (priority) {
      case MessagePriority.URGENT:
        return '🚨';
      case MessagePriority.HIGH:
        return '⚠️';
      case MessagePriority.NORMAL:
        return 'ℹ️';
      case MessagePriority.LOW:
        return '💬';
      default:
        return 'ℹ️';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-400">メッセージが見つかりません</div>
      </div>
    );
  }

  const priorityInfo = getPriorityLabel(message.priority);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>

        {/* メッセージカード */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* ヘッダー */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getPriorityIcon(message.priority)}</span>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{message.title}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-400 border border-blue-700/50">
                      {getMessageTypeLabel(message.message_type)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityInfo.color} text-white`}>
                      {priorityInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* メタ情報 */}
            <div className="space-y-2 text-sm">
              {message.sender && (
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="font-semibold">送信者:</span>
                  <span className="text-gray-300">{message.sender.username}</span>
                  <span className="text-gray-500">({message.sender.email})</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <span className="font-semibold">送信日時:</span>
                <span className="text-gray-300">
                  {new Date(message.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {message.recipients && (
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="font-semibold">受信者数:</span>
                  <span className="text-gray-300">{message.recipients.length}人</span>
                </div>
              )}
            </div>
          </div>

          {/* 本文 */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">メッセージ本文</h2>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="p-6 border-t border-gray-700 flex gap-3">
            <button
              onClick={() => router.push('/notice')}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              通知一覧に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
