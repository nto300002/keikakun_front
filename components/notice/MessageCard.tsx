'use client';

import { MessageInboxItem, MessagePriority } from '@/types/message';
import { getMessageDisplayMeta, getMessageSenderLabel } from './messageDisplay';

interface MessageCardProps {
  message: MessageInboxItem;
  onMarkAsRead: (messageId: string) => void;
  onArchive?: (messageId: string, isArchived: boolean) => void;
}

export default function MessageCard({
  message,
  onMarkAsRead,
  onArchive,
}: MessageCardProps) {
  // 優先度のラベル
  const getPriorityLabel = (priority: MessagePriority) => {
    switch (priority) {
      case MessagePriority.URGENT:
        return '緊急';
      case MessagePriority.HIGH:
        return '高';
      case MessagePriority.NORMAL:
        return '通常';
      case MessagePriority.LOW:
        return '低';
      default:
        return '';
    }
  };

  const style = getMessageDisplayMeta(message.message_type, message.priority);
  const senderLabel = getMessageSenderLabel(message);

  return (
    <div
      className={`${style.cardClassName} border ${style.borderClassName} rounded-lg p-5 mb-4 ${
        message.is_read ? 'opacity-60' : ''
      }`}
    >
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className={`text-3xl ${style.textClassName}`}>{style.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-900 font-bold text-xl dark:text-white">{message.title}</span>
              {!message.is_read && (
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-600 text-white">
                  NEW
                </span>
              )}
              {(message.priority === MessagePriority.HIGH ||
                message.priority === MessagePriority.URGENT) && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    message.priority === MessagePriority.URGENT
                      ? 'bg-red-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}
                >
                  {getPriorityLabel(message.priority)}
                </span>
              )}
            </div>
            {/* メッセージタイプラベルと送信者情報 */}
            <div className="flex items-center gap-2 mb-2">
              <span
                  className={`inline-block px-3 py-1 rounded text-sm font-bold ${style.badgeClassName}`}
              >
                {style.label}
              </span>
              {senderLabel && (
                <span className="text-slate-600 text-base font-semibold dark:text-gray-400">
                  {senderLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メッセージ内容 */}
      <div className="mb-4 pl-11">
        <div className="bg-white/70 rounded-lg p-4 border border-slate-200 dark:bg-gray-800/30 dark:border-gray-700/50">
          <p className="text-slate-700 text-lg font-semibold leading-relaxed whitespace-pre-wrap line-clamp-3 dark:text-gray-300">
            {message.content}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-slate-500 text-base font-semibold dark:text-gray-500">
            {new Date(message.created_at).toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {message.is_read && message.read_at && (
            <p className="text-slate-500 text-base font-semibold dark:text-gray-500">
              既読: {new Date(message.read_at).toLocaleString('ja-JP', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 flex-wrap pl-11">
        {/* 既読ボタン */}
        {!message.is_read && (
          <button
            onClick={() => onMarkAsRead(message.message_id)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-lg text-base font-bold transition-colors dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-gray-300"
          >
            既読にする
          </button>
        )}

        {/* アーカイブボタン */}
        {onArchive && (
          <button
            onClick={() => onArchive(message.message_id, !message.is_archived)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-lg text-base font-bold transition-colors dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-gray-300"
          >
            {message.is_archived ? 'アーカイブ解除' : 'アーカイブ'}
          </button>
        )}
      </div>
    </div>
  );
}
