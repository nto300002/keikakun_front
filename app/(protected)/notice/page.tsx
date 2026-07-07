'use client';

import { useState } from 'react';
import ApprovalRequestsTab from '@/components/notice/ApprovalRequestsTab';
import DeadlineAlertsTab from '@/components/notice/DeadlineAlertsTab';
import MessagesTab from '@/components/notice/MessagesTab';
import MessageSendForm from '@/components/messages/MessageSendForm';
import FeedbackForm from '@/components/protected/profile/FeedbackForm';
import { getNoticeTabLabel } from '@/components/notice/messageDisplay';

type TabType = 'messages' | 'approvals' | 'deadlines' | 'send' | 'feedback';
type CategoryType = 'recipients' | 'messages' | 'feedback';

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState<TabType>('deadlines');
  const [isReceiveMenuOpen, setIsReceiveMenuOpen] = useState(false);
  const isReceiveActive = activeTab === 'messages' || activeTab === 'approvals';
  let activeCategory: CategoryType = 'messages';
  if (activeTab === 'deadlines') {
    activeCategory = 'recipients';
  } else if (activeTab === 'feedback') {
    activeCategory = 'feedback';
  }

  const handleSelectReceiveTab = (tab: Extract<TabType, 'messages' | 'approvals'>) => {
    setActiveTab(tab);
    setIsReceiveMenuOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 大カテゴリタブ */}
      <div className="flex gap-2 border-b border-slate-300 dark:border-gray-700">
        <button
          onClick={() => {
            setActiveTab('deadlines');
            setIsReceiveMenuOpen(false);
          }}
          className={`px-7 py-4 text-lg font-bold transition-all ${
            activeCategory === 'recipients'
              ? 'text-slate-950 border-b-2 border-blue-500 bg-blue-50 dark:text-white dark:bg-blue-900/20'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/30'
          }`}
        >
          期限通知
        </button>
        <button
          onClick={() => {
            setActiveTab('messages');
            setIsReceiveMenuOpen(false);
          }}
          className={`px-7 py-4 text-lg font-bold transition-all ${
            activeCategory === 'messages'
              ? 'text-slate-950 border-b-2 border-blue-500 bg-blue-50 dark:text-white dark:bg-blue-900/20'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/30'
          }`}
        >
          個別メッセージ/お知らせ
        </button>
        <button
          onClick={() => {
            setActiveTab('feedback');
            setIsReceiveMenuOpen(false);
          }}
          className={`px-7 py-4 text-lg font-bold transition-all ${
            activeCategory === 'feedback'
              ? 'text-slate-950 border-b-2 border-blue-500 bg-blue-50 dark:text-white dark:bg-blue-900/20'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/30'
          }`}
        >
          {getNoticeTabLabel('feedback')}
        </button>
      </div>

      {/* 個別タブナビゲーション */}
      {activeCategory !== 'feedback' && (
        <div className="mb-6 flex gap-2 border-b border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-900/40">
          {activeCategory === 'recipients' && (
            <button
              onClick={() => {
                setActiveTab('deadlines');
                setIsReceiveMenuOpen(false);
              }}
              className={`px-6 py-3 text-base font-bold transition-all ${
                activeTab === 'deadlines'
                  ? 'text-slate-950 border-b-2 border-blue-500 bg-white dark:text-white dark:bg-gray-800'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/70'
              }`}
            >
              更新期限の近い利用者
            </button>
          )}

          {activeCategory === 'messages' && (
            <>
              <div className="relative">
                <button
                  onClick={() => setIsReceiveMenuOpen((open) => !open)}
                  className={`px-6 py-3 text-base font-bold transition-all flex items-center gap-2 ${
                    isReceiveActive
                      ? 'text-slate-950 border-b-2 border-blue-500 bg-white dark:text-white dark:bg-gray-800'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/70'
                  }`}
                  aria-expanded={isReceiveMenuOpen}
                  aria-haspopup="menu"
                >
                  📥 受信
                  <span className="text-sm" aria-hidden="true">
                    {isReceiveMenuOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isReceiveMenuOpen && (
                  <div
                    className="absolute left-0 top-full z-20 mt-2 min-w-56 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
                    role="menu"
                  >
                    <button
                      onClick={() => handleSelectReceiveTab('messages')}
                      className={`block w-full px-5 py-4 text-left text-lg font-bold transition-colors ${
                        activeTab === 'messages'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                      role="menuitem"
                    >
                      メッセージ
                    </button>
                    <button
                      onClick={() => handleSelectReceiveTab('approvals')}
                      className={`block w-full px-5 py-4 text-left text-lg font-bold transition-colors ${
                        activeTab === 'approvals'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                      role="menuitem"
                    >
                      承認リクエスト
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveTab('send');
                  setIsReceiveMenuOpen(false);
                }}
                className={`px-6 py-3 text-base font-bold transition-all ${
                  activeTab === 'send'
                    ? 'text-slate-950 border-b-2 border-blue-500 bg-white dark:text-white dark:bg-gray-800'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/70'
                }`}
              >
                📤 送信
              </button>
            </>
          )}
        </div>
      )}

      {/* タブコンテンツ */}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'approvals' && <ApprovalRequestsTab />}
      {activeTab === 'deadlines' && <DeadlineAlertsTab />}
      {activeTab === 'send' && <MessageSendForm />}
      {activeTab === 'feedback' && (
        <div className="pt-6">
          <FeedbackForm />
        </div>
      )}
    </div>
  );
}
