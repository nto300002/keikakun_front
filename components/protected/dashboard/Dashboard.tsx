'use client';

import { useState } from 'react';

interface ServiceRecipient {
  id: string;
  name: string;
  planType: string;
  daysRemaining: number;
  status: 'safe' | 'warning' | 'urgent';
  nextDeadline: string;
}

export default function Dashboard() {
  const [serviceRecipients] = useState<ServiceRecipient[]>([
    {
      id: '1',
      name: '田中 太郎',
      planType: '個別支援計画',
      daysRemaining: 45,
      status: 'safe',
      nextDeadline: '2024-10-15'
    },
    {
      id: '2',
      name: '佐藤 花子',
      planType: 'モニタリング',
      daysRemaining: 7,
      status: 'warning',
      nextDeadline: '2024-09-05'
    },
    {
      id: '3',
      name: '山田 次郎',
      planType: '個別支援計画',
      daysRemaining: 2,
      status: 'urgent',
      nextDeadline: '2024-08-30'
    },
    {
      id: '4',
      name: '鈴木 美咲',
      planType: 'モニタリング',
      daysRemaining: 21,
      status: 'safe',
      nextDeadline: '2024-09-20'
    },
    {
      id: '5',
      name: '高橋 一郎',
      planType: '個別支援計画',
      daysRemaining: 14,
      status: 'warning',
      nextDeadline: '2024-09-12'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'urgent': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return '安全';
      case 'warning': return '注意';
      case 'urgent': return '緊急';
      default: return '不明';
    }
  };

  const urgentCount = serviceRecipients.filter(sr => sr.status === 'urgent').length;
  const warningCount = serviceRecipients.filter(sr => sr.status === 'warning').length;

  return (
    <div className="min-h-screen bg-[#0C1421] text-white">
      {/* ヘッダー */}
      <header className="bg-[#1A1A1A] border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ケイカくん ダッシュボード</h1>
            <p className="text-gray-400 text-sm">個別支援計画管理システム</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">ようこそ</p>
              <p className="font-semibold">管理者 様</p>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">管</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* サマリーカード */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">緊急対応</p>
                <p className="text-2xl font-bold text-red-400">{urgentCount}件</p>
              </div>
              <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">要注意</p>
                <p className="text-2xl font-bold text-yellow-400">{warningCount}件</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">利用者総数</p>
                <p className="text-2xl font-bold text-[#10B981]">{serviceRecipients.length}名</p>
              </div>
              <div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#10B981] text-xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* 利用者一覧 */}
        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">利用者一覧</h2>
              <button className="bg-[#10B981] hover:bg-[#0F9F6E] text-white px-4 py-2 rounded-lg transition-colors">
                新規登録
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1A1A1A]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    利用者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    計画種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    残り日数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    次回期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {serviceRecipients.map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{recipient.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {recipient.planType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${recipient.daysRemaining <= 7 ? 'text-red-400' : recipient.daysRemaining <= 14 ? 'text-yellow-400' : 'text-green-400'} font-medium`}>
                        {recipient.daysRemaining}日
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recipient.status)}`}>
                        {getStatusText(recipient.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(recipient.nextDeadline).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#10B981] hover:text-[#0F9F6E] mr-4 transition-colors">
                        詳細
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        編集
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-[#2A2A2A] hover:bg-[#353535] border border-gray-700 rounded-lg p-6 text-center transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-400 text-xl">📄</span>
            </div>
            <p className="font-medium text-white">新規計画作成</p>
            <p className="text-gray-400 text-sm mt-1">個別支援計画を新規作成</p>
          </button>

          <button className="bg-[#2A2A2A] hover:bg-[#353535] border border-gray-700 rounded-lg p-6 text-center transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-400 text-xl">📊</span>
            </div>
            <p className="font-medium text-white">レポート作成</p>
            <p className="text-gray-400 text-sm mt-1">月次・年次レポート</p>
          </button>

          <button className="bg-[#2A2A2A] hover:bg-[#353535] border border-gray-700 rounded-lg p-6 text-center transition-colors">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-green-400 text-xl">⚙️</span>
            </div>
            <p className="font-medium text-white">設定</p>
            <p className="text-gray-400 text-sm mt-1">システム設定・権限管理</p>
          </button>

          <button className="bg-[#2A2A2A] hover:bg-[#353535] border border-gray-700 rounded-lg p-6 text-center transition-colors">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-400 text-xl">❓</span>
            </div>
            <p className="font-medium text-white">ヘルプ</p>
            <p className="text-gray-400 text-sm mt-1">使い方・よくある質問</p>
          </button>
        </div>
      </main>
    </div>
  );
}