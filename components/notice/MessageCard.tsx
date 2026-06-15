'use client';

import { MessageInboxItem, MessageType, MessagePriority } from '@/types/message';

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
  // メッセージタイプに応じたスタイルとアイコン
  const getMessageStyle = (type: MessageType, priority: MessagePriority) => {
    // 優先度による色の決定
    if (priority === MessagePriority.URGENT) {
      return {
        icon: '🚨',
        color: 'red',
        bgColor: 'bg-red-50 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-700/50',
        textColor: 'text-red-700 dark:text-red-400',
      };
    } else if (priority === MessagePriority.HIGH) {
      return {
        icon: '⚠️',
        color: 'orange',
        bgColor: 'bg-orange-50 dark:bg-orange-900/30',
        borderColor: 'border-orange-200 dark:border-orange-700/50',
        textColor: 'text-orange-700 dark:text-orange-400',
      };
    }

    // メッセージタイプによる色の決定（通常・低優先度）
    switch (type) {
      case MessageType.PERSONAL:
        return {
          icon: '💬',
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-700/50',
          textColor: 'text-blue-700 dark:text-blue-400',
        };
      case MessageType.ANNOUNCEMENT:
        return {
          icon: '📢',
          color: 'purple',
          bgColor: 'bg-purple-50 dark:bg-purple-900/30',
          borderColor: 'border-purple-200 dark:border-purple-700/50',
          textColor: 'text-purple-700 dark:text-purple-400',
        };
      case MessageType.SYSTEM:
        return {
          icon: '⚙️',
          color: 'gray',
          bgColor: 'bg-slate-50 dark:bg-gray-900/30',
          borderColor: 'border-slate-200 dark:border-gray-700/50',
          textColor: 'text-slate-600 dark:text-gray-400',
        };
      case MessageType.INQUIRY:
        return {
          icon: '❓',
          color: 'teal',
          bgColor: 'bg-teal-50 dark:bg-teal-900/30',
          borderColor: 'border-teal-200 dark:border-teal-700/50',
          textColor: 'text-teal-700 dark:text-teal-400',
        };
      default:
        return {
          icon: 'ℹ️',
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-700/50',
          textColor: 'text-blue-700 dark:text-blue-400',
        };
    }
  };

  // メッセージタイプのラベル
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

  const style = getMessageStyle(message.message_type, message.priority);

  return (
    <div
      className={`${style.bgColor} border ${style.borderColor} rounded-lg p-5 mb-4 ${
        message.is_read ? 'opacity-60' : ''
      }`}
    >
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className={`text-3xl ${style.textColor}`}>{style.icon}</span>
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
                  className={`inline-block px-3 py-1 rounded text-sm font-bold ${style.textColor} bg-white/70 dark:bg-gray-800/50`}
              >
                {getMessageTypeLabel(message.message_type)}
              </span>
              {message.sender && (
                <span className="text-slate-600 text-base font-semibold dark:text-gray-400">
                  送信者: {message.sender.last_name} {message.sender.first_name}
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
