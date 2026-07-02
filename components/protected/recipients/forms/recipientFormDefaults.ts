import type {
  DisabilityDetailData,
  EmergencyContactData,
  RecipientFormData,
  RecipientFormSection,
} from './recipientFormTypes';

export const RECIPIENT_FORM_SECTIONS: RecipientFormSection[] = [
  { id: 0, title: '基本情報', description: '氏名・ふりがな・生年月日・性別' },
  { id: 1, title: '連絡先・住所情報', description: '住所・居住形態・交通手段・電話番号' },
  { id: 2, title: '緊急連絡先', description: '緊急時の連絡先情報' },
  { id: 3, title: '障害・疾患情報', description: '障害または疾患名・生活保護受給状況' },
  { id: 4, title: '手帳・年金詳細', description: '各種手帳・年金の詳細情報' },
];

export const createEmptyEmergencyContact = (priority = 1): EmergencyContactData => ({
  firstName: '',
  lastName: '',
  firstNameFurigana: '',
  lastNameFurigana: '',
  relationship: '',
  tel: '',
  address: '',
  notes: '',
  priority,
});

export const createEmptyDisabilityDetail = (): DisabilityDetailData => ({
  category: '',
  gradeOrLevel: '',
  physicalDisabilityType: '',
  physicalDisabilityTypeOtherText: '',
  applicationStatus: '',
});

export const INITIAL_RECIPIENT_FORM_DATA: RecipientFormData = {
  basicInfo: {
    firstName: '',
    lastName: '',
    firstNameFurigana: '',
    lastNameFurigana: '',
    birthDay: '',
    gender: '',
  },
  contactAddress: {
    address: '',
    formOfResidence: '',
    formOfResidenceOtherText: '',
    meansOfTransportation: '',
    meansOfTransportationOtherText: '',
    tel: '',
  },
  emergencyContacts: [createEmptyEmergencyContact()],
  disabilityInfo: {
    disabilityOrDiseaseName: '',
    livelihoodProtection: '',
    specialRemarks: '',
  },
  // 手帳・年金詳細は任意項目のため初期値は空配列とする。
  // 空エントリを持つとバックエンドの enum バリデーションで 422 エラーになる。
  disabilityDetails: [],
};
