export type InquiryReplyDeliveryMode = 'app_and_email' | 'email_only' | 'app_only';

export function getInquiryReplyDeliveryMode(
  senderEmail: string | null,
  senderStaffId: string | null
): InquiryReplyDeliveryMode {
  if (senderEmail && senderStaffId) return 'app_and_email';
  if (senderEmail) return 'email_only';
  return 'app_only';
}

export function getInquiryReplyDeliveryMessage(mode: InquiryReplyDeliveryMode): string {
  if (mode === 'app_and_email') return '返信はアプリ内通知とメールの両方で送信されます。';
  if (mode === 'email_only') return '返信はメールで送信されます。';
  return '送信者のメールアドレスが未設定のため、アプリ内通知のみ送信されます。';
}
