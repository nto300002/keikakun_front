'use client';

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { assessmentApi, type FamilyMember } from '@/lib/assessment';
import FamilyMemberForm from './FamilyMemberForm';
import ExpandableText from '@/components/ui/ExpandableText';

interface FamilyMemberListProps {
  recipientId: string;
  familyMembers: FamilyMember[];
  onRefresh: () => void;
}

export default function FamilyMemberList({
  recipientId,
  familyMembers,
  onRefresh,
}: FamilyMemberListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getHouseholdLabel = (household: string) => {
    return household === 'same' ? '同じ' : '別';
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingMember(undefined);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この家族情報を削除してもよろしいですか?')) {
      return;
    }

    setDeletingId(id);
    try {
      await assessmentApi.familyMembers.delete(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete family member:', err);
      alert('家族情報の削除に失敗しました。');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMember(undefined);
    onRefresh();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMember(undefined);
  };

  if (showForm) {
    return (
      <div>
        <h4 className="text-md font-semibold text-white mb-4">
          {editingMember ? '家族情報の編集' : '家族情報の追加'}
        </h4>
        <FamilyMemberForm
          recipientId={recipientId}
          familyMember={editingMember}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#0ea571] text-white rounded-lg transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          家族を追加
        </button>
      </div>

      {familyMembers.length === 0 ? (
        <p className="text-gray-100 text-sm">家族情報が登録されていません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-3 text-gray-100 font-medium">氏名</th>
                <th className="text-left py-2 px-3 text-gray-100 font-medium">続柄</th>
                <th className="text-left py-2 px-3 text-gray-100 font-medium">世帯</th>
                <th className="text-left py-2 px-3 text-gray-100 font-medium">健康状態</th>
                <th className="text-left py-2 px-3 text-gray-100 font-medium">備考</th>
                <th className="text-right py-2 px-3 text-gray-100 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {familyMembers.map((member) => (
                <tr key={member.id} className="border-b border-[#2a3441]/50">
                  <td className="py-3 px-3 text-white">{member.name}</td>
                  <td className="py-3 px-3 text-white">{member.relationship}</td>
                  <td className="py-3 px-3 text-white">{getHouseholdLabel(member.household)}</td>
                  <td className="py-3 px-3 text-white">{member.ones_health}</td>
                  <td className="py-3 px-3 text-gray-100">
                    <ExpandableText text={member.remarks} maxLength={50} />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-1 text-gray-100 hover:text-white hover:bg-[#2a3441] rounded transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
