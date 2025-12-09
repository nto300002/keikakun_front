'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { messagesApi } from '@/lib/api/messages';
import { MessagePriority } from '@/types/message';
import { toast } from '@/lib/toast-debug';
import { http } from '@/lib/http';

interface Staff {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function MessageSendForm() {
  const router = useRouter();
  const [messageType, setMessageType] = useState<'personal' | 'announcement'>('personal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<MessagePriority>(MessagePriority.NORMAL);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStaff, setIsFetchingStaff] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // スタッフ一覧とユーザー情報を取得
  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingStaff(true);
      try {
        // 現在のユーザー情報を取得
        const currentUser = await http.get<Staff>('/api/v1/staffs/me');
        setCurrentUserRole(currentUser.role);

        // スタッフ一覧を取得（事業所内の全スタッフ）
        const staffResponse = await http.get<Staff[]>('/api/v1/offices/me/staffs/all');
        // 自分以外のスタッフをフィルタリング
        const otherStaffs = staffResponse.filter(staff => staff.id !== currentUser.id);
        setStaffList(otherStaffs);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('スタッフ一覧の取得に失敗しました', message);
        toast.error('スタッフ一覧の取得に失敗しました');
      } finally {
        setIsFetchingStaff(false);
      }
    };

    fetchData();
  }, []);

  // スタッフ選択のトグル
  const handleStaffToggle = (staffId: string) => {
    setSelectedStaffIds(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  // 全員選択/解除
  const handleSelectAll = () => {
    if (selectedStaffIds.length === staffList.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(staffList.map(staff => staff.id));
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    if (!content.trim()) {
      toast.error('本文を入力してください');
      return;
    }
    if (messageType === 'personal' && selectedStaffIds.length === 0) {
      toast.error('受信者を選択してください');
      return;
    }
    if (messageType === 'announcement' && currentUserRole !== 'owner' && currentUserRole !== 'manager') {
      toast.error('一斉通知を送信する権限がありません');
      return;
    }

    setIsLoading(true);
    try {
      if (messageType === 'personal') {
        await messagesApi.sendPersonalMessage({
          recipient_staff_ids: selectedStaffIds,
          title,
          content,
          priority,
        });
        toast.success('メッセージを送信しました');
      } else {
        await messagesApi.sendAnnouncement({
          title,
          content,
          priority,
        });
        toast.success('一斉通知を送信しました');
      }

      // 送信成功後、通知ページにリダイレクト
      router.push('/notice');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'メッセージの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">メッセージ送信(事務所内)</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* メッセージタイプ選択 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-sm font-semibold mb-3 text-gray-200">
            メッセージタイプ
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setMessageType('personal')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                messageType === 'personal'
                  ? 'bg-blue-600 text-white border-2 border-blue-500'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border-2 border-gray-600'
              }`}
            >
              💬 個別メッセージ
            </button>
            <button
              type="button"
              onClick={() => setMessageType('announcement')}
              disabled={currentUserRole !== 'owner' && currentUserRole !== 'manager'}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                messageType === 'announcement'
                  ? 'bg-purple-600 text-white border-2 border-purple-500'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border-2 border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              📢 一斉通知
              {(currentUserRole !== 'owner' && currentUserRole !== 'manager') && (
                <span className="block text-xs mt-1">(オーナー/管理者のみ)</span>
              )}
            </button>
          </div>
        </div>

        {/* 受信者選択（個別メッセージの場合のみ） */}
        {messageType === 'personal' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-200">
                受信者選択 ({selectedStaffIds.length}人選択中)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                {selectedStaffIds.length === staffList.length ? '全員解除' : '全員選択'}
              </button>
            </div>

            {isFetchingStaff ? (
              <div className="text-center py-4 text-gray-400">読み込み中...</div>
            ) : staffList.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                送信可能なスタッフがいません
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-900/50 rounded-lg p-4">
                {staffList.map((staff) => (
                  <label
                    key={staff.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStaffIds.includes(staff.id)}
                      onChange={() => handleStaffToggle(staff.id)}
                      className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{staff.username}</div>
                      <div className="text-gray-400 text-sm">{staff.email}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                      {staff.role === 'owner' ? 'オーナー' : staff.role === 'manager' ? '管理者' : '一般'}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 優先度選択 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-sm font-semibold mb-3 text-gray-200">
            優先度
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: MessagePriority.LOW, label: '低', color: 'gray' },
              { value: MessagePriority.NORMAL, label: '通常', color: 'blue' },
              { value: MessagePriority.HIGH, label: '高', color: 'orange' },
              { value: MessagePriority.URGENT, label: '緊急', color: 'red' },
            ].map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  priority === value
                    ? `bg-${color}-600 text-white border-2 border-${color}-500`
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border-2 border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* タイトル入力 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label htmlFor="title" className="block text-sm font-semibold mb-3 text-gray-200">
            タイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="メッセージのタイトルを入力してください"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="mt-2 text-xs text-gray-400 text-right">
            {title.length} / 200文字
          </div>
        </div>

        {/* 本文入力 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label htmlFor="content" className="block text-sm font-semibold mb-3 text-gray-200">
            本文 <span className="text-red-400">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={10000}
            rows={8}
            placeholder="メッセージの本文を入力してください"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
          <div className="mt-2 text-xs text-gray-400 text-right">
            {content.length} / 10,000文字
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                送信中...
              </>
            ) : (
              <>📤 送信する</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
