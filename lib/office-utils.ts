import { OfficeTypeValue } from '@/types/office';

/**
 * OfficeTypeを日本語表記に変換する
 * @param officeType - 事務所種別
 * @param short - 短縮形を使用するか（デフォルト: false）
 * @returns 日本語表記の事務所種別
 */
export function getOfficeTypeLabel(officeType: OfficeTypeValue | undefined | null, short: boolean = false): string {
  if (!officeType) return '';

  switch (officeType) {
    case 'transition_to_employment':
      return short ? '移行支援' : '就労移行支援';
    case 'type_A_office':
      return short ? '就労A型' : '就労継続支援A型';
    case 'type_B_office':
      return short ? '就労B型' : '就労継続支援B型';
    default:
      return '';
  }
}
