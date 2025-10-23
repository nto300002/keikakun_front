'use client';

import { useState } from 'react';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import IssueAnalysisForm from './forms/IssueAnalysisForm';
import ExpandableText from '@/components/ui/ExpandableText';
import type { IssueAnalysis } from '@/lib/assessment';

interface IssueAnalysisSectionProps {
  recipientId: string;
  issueAnalysis?: IssueAnalysis;
  onRefresh: () => void;
}

export default function IssueAnalysisSection({
  recipientId,
  issueAnalysis,
  onRefresh,
}: IssueAnalysisSectionProps) {
  const [showModal, setShowModal] = useState(false);

  const analysisItems = [
    { label: '好き、得意なこと', field: 'what_i_like_to_do' },
    { label: '嫌い、苦手なこと', field: 'im_not_good_at' },
    { label: '私の望む生活', field: 'the_life_i_want' },
    { label: '特に支援してほしいこと', field: 'the_support_i_want' },
    { label: '支援する時に気をつけてほしいこと', field: 'points_to_keep_in_mind_when_providing_support' },
    { label: '将来の夢や希望', field: 'future_dreams' },
    { label: 'その他', field: 'other' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">課題分析</h3>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors text-sm"
          >
            {issueAnalysis ? (
              <>
                <PencilIcon className="w-4 h-4" />
                編集
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                追加
              </>
            )}
          </button>
        </div>

        {!issueAnalysis ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {analysisItems.map((item) => {
                  const value = issueAnalysis[item.field as keyof IssueAnalysis];
                  return (
                    <tr key={item.field} className="border-b border-[#2a3441]/50">
                      <td className="py-3 px-3 text-gray-400 font-medium w-64">{item.label}</td>
                      <td className="py-3 px-3 text-white">
                        <ExpandableText text={value as string | undefined} maxLength={50} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* モーダル */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="課題分析の編集" size="xl">
        <IssueAnalysisForm
          recipientId={recipientId}
          issueAnalysis={issueAnalysis}
          onSuccess={() => {
            onRefresh();
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
