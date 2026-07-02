import assert from 'node:assert/strict';
import test from 'node:test';

import { mapWelfareRecipientToFormData } from './recipientFormMapper';
import type { WelfareRecipient } from '../../../../lib/welfare-recipients';

test('maps snake_case and camelCase recipient fields to form data', () => {
  const recipient: WelfareRecipient = {
    id: 'recipient-1',
    first_name: '太郎',
    last_name: '山田',
    first_name_furigana: 'たろう',
    last_name_furigana: 'やまだ',
    birth_day: '1990-01-01',
    gender: 'male',
    detail: {
      id: 1,
      welfare_recipient_id: 'recipient-1',
      address: '東京都',
      form_of_residence: '',
      formOfResidence: 'home_alone',
      means_of_transportation: '',
      meansOfTransportation: 'walk',
      tel: '090-0000-0000',
      emergency_contacts: [
        {
          id: 1,
          first_name: '',
          firstName: '花子',
          last_name: '',
          lastName: '山田',
          first_name_furigana: '',
          firstNameFurigana: 'はなこ',
          last_name_furigana: '',
          lastNameFurigana: 'やまだ',
          relationship: '母',
          tel: '090-1111-1111',
          priority: 2,
        },
      ],
    },
    disability_status: {
      id: 1,
      welfare_recipient_id: 'recipient-1',
      disability_or_disease_name: '',
      disabilityOrDiseaseName: 'なし',
      livelihood_protection: '',
      livelihoodProtection: 'not_receiving',
      details: [
        {
          id: 1,
          disability_status_id: 1,
          category: 'physical_handbook',
          grade_or_level: '',
          gradeOrLevel: '2',
          physical_disability_type: '',
          physicalDisabilityType: 'visual',
          physical_disability_type_other_text: '',
          application_status: '',
          applicationStatus: 'acquired',
        },
      ],
    },
  };

  const result = mapWelfareRecipientToFormData(recipient);

  assert.equal(result.basicInfo.firstName, '太郎');
  assert.equal(result.contactAddress.formOfResidence, 'home_alone');
  assert.equal(result.emergencyContacts[0].firstName, '花子');
  assert.equal(result.emergencyContacts[0].priority, 2);
  assert.equal(result.disabilityInfo.disabilityOrDiseaseName, 'なし');
  assert.equal(result.disabilityDetails[0].gradeOrLevel, '2');
});

test('creates editable empty rows when optional nested data is missing', () => {
  const result = mapWelfareRecipientToFormData({
    id: 'recipient-2',
    first_name: '',
    last_name: '',
    first_name_furigana: '',
    last_name_furigana: '',
    birth_day: '',
    gender: '',
  });

  assert.equal(result.emergencyContacts.length, 1);
  assert.equal(result.emergencyContacts[0].priority, 1);
  assert.equal(result.disabilityDetails.length, 1);
  assert.equal(result.disabilityDetails[0].category, '');
});
