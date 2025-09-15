import { DashboardRecipient } from '@/types/dashboard';

/**
 * 今日の日付を 'YYYY-MM-DD' 形式で取得します。
 */
const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時刻をリセットして日付のみで比較
  return today;
};

/**
 * 日付文字列からDateオブジェクトを生成します。
 * @param dateString - 'YYYY-MM-DD' 形式の日付文字列
 */
const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

/**
 * 指定された日付までの残り日数を計算します。
 * @param date - 計算対象の日付
 */
export const getDaysUntil = (date: Date | null): number => {
    if (!date) return Infinity;
    const today = getToday();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


/**
 * ダッシュボードのサマリーカウントを計算します。
 * @param recipients - 利用者情報の配列
 * @param nearDeadlineDays - 期限が近いと判断する日数（デフォルト: 30）
 */
export const calculateSummaryCounts = (
  recipients: DashboardRecipient[],
  nearDeadlineDays: number = 30
) => {
  let expired = 0;
  let nearDeadline = 0;

  recipients.forEach(recipient => {
    const renewalDate = parseDate(recipient.next_renewal_deadline);
    const monitoringDate = parseDate(recipient.monitoring_due_date);

    const renewalDays = renewalDate ? getDaysUntil(renewalDate) : Infinity;
    const monitoringDays = monitoringDate ? getDaysUntil(monitoringDate) : Infinity;

    const isExpired = renewalDays < 0 || monitoringDays < 0;
    
    // 期限切れでない、かつ、いずれかの期限が迫っているか
    const isNear = (renewalDays >= 0 && renewalDays <= nearDeadlineDays) || 
                   (monitoringDays >= 0 && monitoringDays <= nearDeadlineDays);

    if (isExpired) {
      expired++;
    } else if (isNear) {
      nearDeadline++;
    }
  });

  return {
    expired,
    nearDeadline,
    total: recipients.length,
  };
};
