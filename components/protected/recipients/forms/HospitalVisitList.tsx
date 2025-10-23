'use client';

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { assessmentApi, type HospitalVisit } from '@/lib/assessment';
import HospitalVisitForm from './HospitalVisitForm';
import ExpandableText from '@/components/ui/ExpandableText';

interface HospitalVisitListProps {
  recipientId: string;
  hospitalVisits: HospitalVisit[];
  onRefresh: () => void;
}

export default function HospitalVisitList({
  recipientId,
  hospitalVisits,
  onRefresh,
}: HospitalVisitListProps) {
  const [editingVisit, setEditingVisit] = useState<HospitalVisit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingVisit(null);
    onRefresh();
  };

  const handleEdit = (visit: HospitalVisit) => {
    setEditingVisit(visit);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この通院歴を削除してもよろしいですか?')) {
      return;
    }
    setDeletingId(id);
    try {
      await assessmentApi.hospitalVisits.delete(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete hospital visit:', err);
      alert('通院歴の削除に失敗しました。');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVisit(null);
  };

  if (showForm) {
    return (
      <HospitalVisitForm
        recipientId={recipientId}
        hospitalVisit={editingVisit || undefined}
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

      {hospitalVisits.length === 0 ? (
        <p className="text-gray-400 text-center py-8">通院歴がありません</p>
      ) : (
        <div className="space-y-3">
          {hospitalVisits.map((visit) => (
            <div
              key={visit.id}
              className="p-4 bg-[#0f1419] rounded-lg border border-[#2a3441] hover:border-[#3a4451] transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">病名</p>
                      <p className="text-white font-medium">{visit.disease}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">症状</p>
                      <p className="text-white">{visit.symptoms}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">医療機関名</p>
                      <p className="text-white">{visit.medical_institution}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">主治医</p>
                      <p className="text-white">{visit.doctor}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">電話番号</p>
                      <p className="text-white">{visit.tel}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">通院頻度</p>
                      <p className="text-white">{visit.frequency_of_hospital_visits}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">服薬状況</p>
                      <p className="text-white">{visit.taking_medicine ? 'あり' : 'なし'}</p>
                    </div>
                    {(visit.date_started || visit.date_ended) && (
                      <div>
                        <p className="text-gray-400">期間</p>
                        <p className="text-white">
                          {visit.date_started && new Date(visit.date_started).toLocaleDateString('ja-JP')}
                          {visit.date_started && visit.date_ended && ' 〜 '}
                          {visit.date_ended && new Date(visit.date_ended).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    )}
                  </div>
                  {visit.special_remarks && (
                    <div>
                      <p className="text-gray-400 text-sm">特記事項</p>
                      <div className="text-white text-sm">
                        <ExpandableText text={visit.special_remarks} maxLength={50} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(visit)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="編集"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(visit.id)}
                    disabled={deletingId === visit.id}
                    className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                    title="削除"
                  >
                    {deletingId === visit.id ? (
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
