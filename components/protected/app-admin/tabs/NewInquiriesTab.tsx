'use client';

import { useState } from 'react';
import InquiryList from '@/components/admin/inquiry/InquiryList';
import InquiryDetail from '@/components/admin/inquiry/InquiryDetail';
import InquiryReplyModal from '@/components/admin/inquiry/InquiryReplyModal';

type ViewMode = 'list' | 'detail';

export default function NewInquiriesTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyInquiryId, setReplyInquiryId] = useState<string | null>(null);

  const handleSelectInquiry = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedInquiryId(null);
    setViewMode('list');
  };

  const handleOpenReply = (inquiryId: string) => {
    setReplyInquiryId(inquiryId);
    setIsReplyModalOpen(true);
  };

  const handleCloseReply = () => {
    setIsReplyModalOpen(false);
    setReplyInquiryId(null);
  };

  const handleReplySuccess = () => {
    // 返信成功後、詳細画面を再読み込み
    if (selectedInquiryId) {
      // 詳細画面がリロードされるようにする
      setViewMode('list');
      setTimeout(() => {
        setViewMode('detail');
      }, 100);
    }
  };

  return (
    <div>
      {viewMode === 'list' && <InquiryList onSelectInquiry={handleSelectInquiry} />}
      {viewMode === 'detail' && selectedInquiryId && (
        <InquiryDetail
          inquiryId={selectedInquiryId}
          onBack={handleBackToList}
          onOpenReply={handleOpenReply}
        />
      )}

      {/* 返信モーダル */}
      {isReplyModalOpen && replyInquiryId && (
        <InquiryReplyModal
          isOpen={isReplyModalOpen}
          onClose={handleCloseReply}
          inquiryId={replyInquiryId}
          inquiryTitle="問い合わせ件名" // TODO: 実際の件名を渡す
          senderEmail="example@example.com" // TODO: 実際の送信者メールを渡す
          onSuccess={handleReplySuccess}
        />
      )}
    </div>
  );
}
