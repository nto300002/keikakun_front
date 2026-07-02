import {
  createEmptyDisabilityDetail,
  createEmptyEmergencyContact,
} from './recipientFormDefaults';
import type {
  BasicInfoData,
  ContactAddressData,
  DisabilityDetailData,
  DisabilityInfoData,
  EmergencyContactData,
  RecipientFormData,
} from './recipientFormTypes';

export function addEmergencyContactToForm(formData: RecipientFormData): RecipientFormData {
  if (formData.emergencyContacts.length >= 3) return formData;

  return {
    ...formData,
    emergencyContacts: [
      ...formData.emergencyContacts,
      createEmptyEmergencyContact(formData.emergencyContacts.length + 1),
    ],
  };
}

export function removeEmergencyContactFromForm(formData: RecipientFormData, index: number): RecipientFormData {
  if (formData.emergencyContacts.length <= 1) return formData;

  return {
    ...formData,
    emergencyContacts: formData.emergencyContacts.filter((_, i) => i !== index),
  };
}

export function addDisabilityDetailToForm(formData: RecipientFormData): RecipientFormData {
  return {
    ...formData,
    disabilityDetails: [...formData.disabilityDetails, createEmptyDisabilityDetail()],
  };
}

export function removeDisabilityDetailFromForm(formData: RecipientFormData, index: number): RecipientFormData {
  if (formData.disabilityDetails.length <= 1) return formData;

  return {
    ...formData,
    disabilityDetails: formData.disabilityDetails.filter((_, i) => i !== index),
  };
}

export function updateBasicInfoField(
  formData: RecipientFormData,
  field: keyof BasicInfoData,
  value: string,
): RecipientFormData {
  return {
    ...formData,
    basicInfo: { ...formData.basicInfo, [field]: value },
  };
}

export function updateContactAddressField(
  formData: RecipientFormData,
  field: keyof ContactAddressData,
  value: string,
): RecipientFormData {
  return {
    ...formData,
    contactAddress: { ...formData.contactAddress, [field]: value },
  };
}

export function updateEmergencyContactField(
  formData: RecipientFormData,
  index: number,
  field: keyof EmergencyContactData,
  value: string,
): RecipientFormData {
  return {
    ...formData,
    emergencyContacts: formData.emergencyContacts.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    ),
  };
}

export function updateDisabilityInfoField(
  formData: RecipientFormData,
  field: keyof DisabilityInfoData,
  value: string,
): RecipientFormData {
  return {
    ...formData,
    disabilityInfo: { ...formData.disabilityInfo, [field]: value },
  };
}

export function changeDisabilityDetailField(
  formData: RecipientFormData,
  index: number,
  field: keyof DisabilityDetailData,
  value: string,
): RecipientFormData {
  return {
    ...formData,
    disabilityDetails: formData.disabilityDetails.map((detail, i) => {
      if (i !== index) return detail;

      const updatedDetail = { ...detail, [field]: value };
      if (field === 'category') {
        updatedDetail.gradeOrLevel = '';
      }
      return updatedDetail;
    }),
  };
}
