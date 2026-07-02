import type { InquiryFullResponse } from '../../../../types/inquiry';

export interface ReplyInquiryInfo {
  inquiryId: string;
  inquiryTitle: string;
  senderEmail: string | null;
}

export function getReplyInquiryInfo(inquiry: InquiryFullResponse): ReplyInquiryInfo {
  return {
    inquiryId: inquiry.id,
    inquiryTitle: inquiry.message.title,
    senderEmail: inquiry.inquiry_detail.sender_email,
  };
}
