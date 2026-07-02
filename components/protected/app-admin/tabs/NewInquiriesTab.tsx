'use client';

import { useState } from 'react';
import InquiryList from '@/components/admin/inquiry/InquiryList';
import InquiryDetail from '@/components/admin/inquiry/InquiryDetail';
import InquiryReplyModal from '@/components/admin/inquiry/InquiryReplyModal';
import type { InquiryFullResponse } from '@/types/inquiry';
import { getReplyInquiryInfo, type ReplyInquiryInfo } from './newInquiriesTab.helpers';

type ViewMode = 'list' | 'detail';

export default function NewInquiriesTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyInquiry, setReplyInquiry] = useState<ReplyInquiryInfo | null>(null);

  const handleSelectInquiry = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedInquiryId(null);
    setViewMode('list');
  };

  const handleOpenReply = (inquiry: InquiryFullResponse) => {
    setReplyInquiry(getReplyInquiryInfo(inquiry));
    setIsReplyModalOpen(true);
  };

  const handleCloseReply = () => {
    setIsReplyModalOpen(false);
    setReplyInquiry(null);
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
      {isReplyModalOpen && replyInquiry && (
        <InquiryReplyModal
          isOpen={isReplyModalOpen}
          onClose={handleCloseReply}
          inquiryId={replyInquiry.inquiryId}
          inquiryTitle={replyInquiry.inquiryTitle}
          senderEmail={replyInquiry.senderEmail}
          onSuccess={handleReplySuccess}
        />
      )}
    </div>
  );
}
