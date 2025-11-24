'use client';

import { useState, useEffect } from 'react';
import { MessageInboxItem, MessageType } from '@/types/message';
import { messagesApi } from '@/lib/api/messages';
import MessageCard from './MessageCard';
import { toast } from '@/lib/toast-debug';

export default function MessagesTab() {
  const [messages, setMessages] = useState<MessageInboxItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'personal' | 'announcement'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // フィルタに応じてパラメータを設定
      const params: {
        is_read?: boolean;
        message_type?: string;
      } = {};

      if (filter === 'unread') {
        params.is_read = false;
      } else if (filter === 'personal') {
        params.message_type = MessageType.PERSONAL;
      } else if (filter === 'announcement') {
        params.message_type = MessageType.ANNOUNCEMENT;
      }

      const data = await messagesApi.getInbox(params);
      setMessages(data?.messages || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'メッセージの取得に失敗しました');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // メッセージ一覧取得
  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // 既読にする
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messagesApi.markAsRead(messageId);
      await loadMessages();
      toast.success('メッセージを既読にしました');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'メッセージの既読処理に失敗しました');
    }
  };

  // 全て既読にする
  const handleMarkAllAsRead = async () => {
    try {
      await messagesApi.markAllAsRead();
      await loadMessages();
      toast.success('すべてのメッセージを既読にしました');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || '一括既読処理に失敗しました');
    }
  };

  // アーカイブ/解除
  const handleArchive = async (messageId: string, isArchived: boolean) => {
    try {
      await messagesApi.archiveMessage(messageId, isArchived);
      await loadMessages();
      toast.success(isArchived ? 'メッセージをアーカイブしました' : 'アーカイブを解除しました');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'アーカイブ処理に失敗しました');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">メッセージ・お知らせ</h2>

      {/* フィルター */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          未読のみ
        </button>
        <button
          onClick={() => setFilter('personal')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'personal'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          💬 個別メッセージ
        </button>
        <button
          onClick={() => setFilter('announcement')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'announcement'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          📢 お知らせ
        </button>
        <button
          onClick={handleMarkAllAsRead}
          disabled={isLoading}
          className="ml-auto bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          すべて既読にする
        </button>
      </div>

      {/* メッセージ一覧 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {filter === 'unread' && '未読のメッセージはありません'}
          {filter === 'personal' && '個別メッセージはありません'}
          {filter === 'announcement' && 'お知らせはありません'}
          {filter === 'all' && 'メッセージはありません'}
        </div>
      ) : (
        messages.map((message) => (
          <MessageCard
            key={message.message_id}
            message={message}
            onMarkAsRead={handleMarkAsRead}
            onArchive={handleArchive}
          />
        ))
      )}
    </div>
  );
}
