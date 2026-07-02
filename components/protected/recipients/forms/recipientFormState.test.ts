import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addDisabilityDetailToForm,
  addEmergencyContactToForm,
  changeDisabilityDetailField,
  removeDisabilityDetailFromForm,
  removeEmergencyContactFromForm,
  updateBasicInfoField,
} from './recipientFormState';
import { INITIAL_RECIPIENT_FORM_DATA } from './recipientFormDefaults';

test('adds emergency contacts up to three and keeps priorities sequential', () => {
  const second = addEmergencyContactToForm(INITIAL_RECIPIENT_FORM_DATA);
  const third = addEmergencyContactToForm(second);
  const stillThird = addEmergencyContactToForm(third);

  assert.equal(second.emergencyContacts.length, 2);
  assert.equal(third.emergencyContacts.length, 3);
  assert.equal(stillThird.emergencyContacts.length, 3);
  assert.deepEqual(third.emergencyContacts.map((contact) => contact.priority), [1, 2, 3]);
});

test('does not remove the last emergency contact or disability detail', () => {
  const withTwoContacts = addEmergencyContactToForm(INITIAL_RECIPIENT_FORM_DATA);
  const oneContact = removeEmergencyContactFromForm(withTwoContacts, 1);
  const stillOneContact = removeEmergencyContactFromForm(oneContact, 0);

  const withOneDetail = addDisabilityDetailToForm(INITIAL_RECIPIENT_FORM_DATA);
  const stillOneDetail = removeDisabilityDetailFromForm(withOneDetail, 0);

  assert.equal(oneContact.emergencyContacts.length, 1);
  assert.equal(stillOneContact.emergencyContacts.length, 1);
  assert.equal(stillOneDetail.disabilityDetails.length, 1);
});

test('updates fields immutably and resets grade when disability category changes', () => {
  const named = updateBasicInfoField(INITIAL_RECIPIENT_FORM_DATA, 'firstName', '太郎');
  const withDetail = changeDisabilityDetailField(
    addDisabilityDetailToForm(INITIAL_RECIPIENT_FORM_DATA),
    0,
    'gradeOrLevel',
    '2',
  );
  const categoryChanged = changeDisabilityDetailField(withDetail, 0, 'category', 'physical_handbook');

  assert.equal(INITIAL_RECIPIENT_FORM_DATA.basicInfo.firstName, '');
  assert.equal(named.basicInfo.firstName, '太郎');
  assert.equal(withDetail.disabilityDetails[0].gradeOrLevel, '2');
  assert.equal(categoryChanged.disabilityDetails[0].category, 'physical_handbook');
  assert.equal(categoryChanged.disabilityDetails[0].gradeOrLevel, '');
});
