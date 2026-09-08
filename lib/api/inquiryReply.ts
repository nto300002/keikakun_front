import type { InquiryReplyRequest } from '@/types/inquiry';

const API_V1_PREFIX = '/api/v1';

export function buildInquiryReplyEndpoint(inquiryId: string): string {
  return `${API_V1_PREFIX}/admin/inquiries/${inquiryId}/reply`;
}

export function buildInquiryReplyPayload(data: InquiryReplyRequest): InquiryReplyRequest {
  return {
    body: data.body,
    send_email: data.send_email,
  };
}
