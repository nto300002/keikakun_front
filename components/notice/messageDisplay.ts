import type { MessageInboxItem, MessagePriority, MessageType } from '../../types/message';

export type MessageDisplayTone = 'personal' | 'notice' | 'system' | 'inquiry' | 'other' | 'urgent' | 'high';

export interface MessageDisplayMeta {
  icon: string;
  label: string;
  tone: MessageDisplayTone;
  cardClassName: string;
  borderClassName: string;
  textClassName: string;
  badgeClassName: string;
}

const urgentMeta: MessageDisplayMeta = {
  icon: '🚨',
  label: '緊急',
  tone: 'urgent',
  cardClassName: 'bg-red-50 dark:bg-red-900/30',
  borderClassName: 'border-red-200 dark:border-red-700/50',
  textClassName: 'text-red-700 dark:text-red-400',
  badgeClassName: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

const highMeta: MessageDisplayMeta = {
  icon: '⚠️',
  label: '高優先',
  tone: 'high',
  cardClassName: 'bg-orange-50 dark:bg-orange-900/30',
  borderClassName: 'border-orange-200 dark:border-orange-700/50',
  textClassName: 'text-orange-700 dark:text-orange-400',
  badgeClassName: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
};

const metaByType: Record<string, MessageDisplayMeta> = {
  personal: {
    icon: '💬',
    label: '個別',
    tone: 'personal',
    cardClassName: 'bg-blue-50 dark:bg-blue-900/30',
    borderClassName: 'border-blue-200 dark:border-blue-700/50',
    textClassName: 'text-blue-700 dark:text-blue-400',
    badgeClassName: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  },
  announcement: {
    icon: '📢',
    label: 'お知らせ',
    tone: 'notice',
    cardClassName: 'bg-purple-50 dark:bg-purple-900/30',
    borderClassName: 'border-purple-200 dark:border-purple-700/50',
    textClassName: 'text-purple-700 dark:text-purple-400',
    badgeClassName: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  },
  system: {
    icon: '⚙️',
    label: 'システム',
    tone: 'system',
    cardClassName: 'bg-slate-50 dark:bg-gray-900/30',
    borderClassName: 'border-slate-200 dark:border-gray-700/50',
    textClassName: 'text-slate-600 dark:text-gray-400',
    badgeClassName: 'bg-slate-200 text-slate-800 dark:bg-gray-800 dark:text-gray-200',
  },
  inquiry: {
    icon: '❓',
    label: 'お問い合わせ',
    tone: 'inquiry',
    cardClassName: 'bg-teal-50 dark:bg-teal-900/30',
    borderClassName: 'border-teal-200 dark:border-teal-700/50',
    textClassName: 'text-teal-700 dark:text-teal-400',
    badgeClassName: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  },
};

const fallbackMeta: MessageDisplayMeta = {
  icon: 'ℹ️',
  label: 'その他',
  tone: 'other',
  cardClassName: 'bg-slate-50 dark:bg-gray-900/30',
  borderClassName: 'border-slate-200 dark:border-gray-700/50',
  textClassName: 'text-slate-600 dark:text-gray-400',
  badgeClassName: 'bg-slate-200 text-slate-800 dark:bg-gray-800 dark:text-gray-200',
};

export function getMessageDisplayMeta(type: MessageType | string, priority: MessagePriority | string): MessageDisplayMeta {
  if (priority === 'urgent') return urgentMeta;
  if (priority === 'high') return highMeta;

  return metaByType[type] ?? fallbackMeta;
}

export function getMessageTypeLabel(type: MessageType | string): string {
  return metaByType[type]?.label ?? fallbackMeta.label;
}

export function isAppAdminAnnouncement(message: MessageInboxItem): boolean {
  if (message.message_type !== 'announcement') return false;
  if (message.sender_staff_id === null) return true;

  const sender = message.sender;
  if (!sender) return false;

  return sender.role === 'app_admin' || sender.username === 'app_admin';
}

export function getMessageSenderLabel(message: MessageInboxItem): string | null {
  if (isAppAdminAnnouncement(message)) {
    return '送信者: 運営';
  }

  if (!message.sender) return null;

  const name = [message.sender.last_name, message.sender.first_name].filter(Boolean).join(' ').trim();
  if (name) return `送信者: ${name}`;

  return '送信者: スタッフ';
}

export function getNoticeTabLabel(tab: 'feedback' | string): string {
  return tab === 'feedback' ? 'お問い合わせ' : tab;
}

export function getProfileFeedbackLabel(): string {
  return 'お問い合わせ';
}
