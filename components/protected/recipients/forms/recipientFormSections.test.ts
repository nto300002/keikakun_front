import assert from 'node:assert/strict';
import test from 'node:test';

import BasicInfoSection from './BasicInfoSection';
import ContactSection from './ContactSection';
import DisabilityDetailsSection from './DisabilityDetailsSection';
import DisabilitySection from './DisabilitySection';
import EmergencyContactsSection from './EmergencyContactsSection';

test('recipient form section components are exported', () => {
  assert.equal(typeof BasicInfoSection, 'function');
  assert.equal(typeof ContactSection, 'function');
  assert.equal(typeof EmergencyContactsSection, 'function');
  assert.equal(typeof DisabilitySection, 'function');
  assert.equal(typeof DisabilityDetailsSection, 'function');
});
