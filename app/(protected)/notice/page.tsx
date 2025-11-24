'use client';

import { useState } from 'react';
import ApprovalRequestsTab from '@/components/notice/ApprovalRequestsTab';
import MessagesTab from '@/components/notice/MessagesTab';
import MessageSendForm from '@/components/messages/MessageSendForm';

type TabType = 'messages' | 'approvals' | 'send';

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState<TabType>('messages');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* タブナビゲーション */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'messages'
              ? 'text-white border-b-2 border-blue-500 bg-blue-900/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
          }`}
        >
          📬 メッセージ・お知らせ
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'approvals'
              ? 'text-white border-b-2 border-blue-500 bg-blue-900/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
          }`}
        >
          ✅ 承認リクエスト
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'send'
              ? 'text-white border-b-2 border-blue-500 bg-blue-900/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
          }`}
        >
          📤 送信
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'approvals' && <ApprovalRequestsTab />}
      {activeTab === 'send' && <MessageSendForm />}
    </div>
  );
}
