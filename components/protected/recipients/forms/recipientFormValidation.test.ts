import assert from 'node:assert/strict';
import test from 'node:test';

import {
  validateRecipientFormSection,
  type RecipientFormValidationMode,
} from './recipientFormValidation';
import { INITIAL_RECIPIENT_FORM_DATA } from './recipientFormDefaults';
import type { RecipientFormData } from './recipientFormTypes';

const validFormData = (): RecipientFormData => ({
  basicInfo: {
    firstName: '太郎',
    lastName: '山田',
    firstNameFurigana: 'たろう',
    lastNameFurigana: 'やまだ',
    birthDay: '1990-01-01',
    gender: 'male',
  },
  contactAddress: {
    address: '東京都',
    formOfResidence: 'home_alone',
    formOfResidenceOtherText: '',
    meansOfTransportation: 'walk',
    meansOfTransportationOtherText: '',
    tel: '090-0000-0000',
  },
  emergencyContacts: [
    {
      firstName: '花子',
      lastName: '山田',
      firstNameFurigana: 'はなこ',
      lastNameFurigana: 'やまだ',
      relationship: '母',
      tel: '090-1111-1111',
      address: '',
      notes: '',
      priority: 1,
    },
  ],
  disabilityInfo: {
    disabilityOrDiseaseName: 'なし',
    livelihoodProtection: 'not_receiving',
    specialRemarks: '',
  },
  disabilityDetails: [],
});

test('registration mode keeps emergency contact furigana required', () => {
  const formData = validFormData();
  formData.emergencyContacts[0].firstNameFurigana = '';
  formData.emergencyContacts[0].lastNameFurigana = '';

  const result = validateRecipientFormSection(formData, 2, 'registration');

  assert.deepEqual(result, {
    emergencyContact0FirstNameFurigana: '緊急連絡先 名（ふりがな）は必須です',
    emergencyContact0LastNameFurigana: '緊急連絡先 姓（ふりがな）は必須です',
  });
});

test('edit mode preserves current emergency contact furigana behavior', () => {
  const formData = validFormData();
  formData.emergencyContacts[0].firstNameFurigana = '';
  formData.emergencyContacts[0].lastNameFurigana = '';

  const result = validateRecipientFormSection(formData, 2, 'edit');

  assert.deepEqual(result, {});
});

test('required section errors match current form behavior', () => {
  const cases: Array<{
    sectionId: number;
    mode: RecipientFormValidationMode;
    expected: Record<string, string>;
  }> = [
    {
      sectionId: 0,
      mode: 'registration',
      expected: {
        firstName: '名は必須です',
        lastName: '姓は必須です',
        firstNameFurigana: '名（ふりがな）は必須です',
        lastNameFurigana: '姓（ふりがな）は必須です',
        birthDay: '生年月日は必須です',
        gender: '性別は必須です',
      },
    },
    {
      sectionId: 1,
      mode: 'registration',
      expected: {
        address: '住所は必須です',
        formOfResidence: '居住形態は必須です',
        meansOfTransportation: '交通手段は必須です',
        tel: '電話番号は必須です',
      },
    },
    {
      sectionId: 3,
      mode: 'edit',
      expected: {
        disabilityOrDiseaseName: '障害または疾患名は必須です',
        livelihoodProtection: '生活保護受給状況は必須です',
      },
    },
    {
      sectionId: 4,
      mode: 'edit',
      expected: {},
    },
  ];

  for (const { sectionId, mode, expected } of cases) {
    assert.deepEqual(validateRecipientFormSection(INITIAL_RECIPIENT_FORM_DATA, sectionId, mode), expected);
  }
});
