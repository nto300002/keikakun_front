'use client';

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { assessmentApi, type ServiceHistory } from '@/lib/assessment';
import ServiceHistoryForm from './ServiceHistoryForm';

interface ServiceHistoryListProps {
  recipientId: string;
  serviceHistory: ServiceHistory[];
  onRefresh: () => void;
}

export default function ServiceHistoryList({
  recipientId,
  serviceHistory,
  onRefresh,
}: ServiceHistoryListProps) {
  const [editingHistory, setEditingHistory] = useState<ServiceHistory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingHistory(null);
    onRefresh();
  };

  const handleEdit = (history: ServiceHistory) => {
    setEditingHistory(history);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このサービス利用歴を削除してもよろしいですか?')) {
      return;
    }
    setDeletingId(id);
    try {
      await assessmentApi.serviceHistory.delete(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete service history:', err);
      alert('サービス利用歴の削除に失敗しました。');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHistory(null);
  };

  if (showForm) {
    return (
      <ServiceHistoryForm
        recipientId={recipientId}
        serviceHistory={editingHistory || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#0ea571] text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          新規追加
        </button>
      </div>

      {serviceHistory.length === 0 ? (
        <p className="text-gray-400 text-center py-8">サービス利用歴がありません</p>
      ) : (
        <div className="space-y-3">
          {serviceHistory.map((history) => (
            <div
              key={history.id}
              className="p-4 bg-[#0f1419] rounded-lg border border-[#2a3441] hover:border-[#3a4451] transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">事業所名</p>
                      <p className="text-white font-medium">{history.office_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">サービス名</p>
                      <p className="text-white">{history.service_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">利用開始日</p>
                      <p className="text-white">
                        {new Date(history.starting_day).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">利用時間/月</p>
                      <p className="text-white">{history.amount_used}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(history)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="編集"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(history.id)}
                    disabled={deletingId === history.id}
                    className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                    title="削除"
                  >
                    {deletingId === history.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
