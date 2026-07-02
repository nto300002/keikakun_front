import type { WelfareRecipient } from '../../../../lib/welfare-recipients';

import {
  createEmptyDisabilityDetail,
  createEmptyEmergencyContact,
} from './recipientFormDefaults';
import type { RecipientFormData } from './recipientFormTypes';

export function mapWelfareRecipientToFormData(initialData: WelfareRecipient): RecipientFormData {
  return {
    basicInfo: {
      firstName: initialData.first_name || '',
      lastName: initialData.last_name || '',
      firstNameFurigana: initialData.first_name_furigana || '',
      lastNameFurigana: initialData.last_name_furigana || '',
      birthDay: initialData.birth_day || '',
      gender: initialData.gender || '',
    },
    contactAddress: {
      address: initialData.detail?.address || '',
      formOfResidence: initialData.detail?.formOfResidence || initialData.detail?.form_of_residence || '',
      formOfResidenceOtherText:
        initialData.detail?.formOfResidenceOtherText || initialData.detail?.form_of_residence_other_text || '',
      meansOfTransportation:
        initialData.detail?.meansOfTransportation || initialData.detail?.means_of_transportation || '',
      meansOfTransportationOtherText:
        initialData.detail?.meansOfTransportationOtherText ||
        initialData.detail?.means_of_transportation_other_text ||
        '',
      tel: initialData.detail?.tel || '',
    },
    emergencyContacts: initialData.detail?.emergency_contacts?.length
      ? initialData.detail.emergency_contacts.map((contact) => ({
          firstName: contact.firstName || contact.first_name || '',
          lastName: contact.lastName || contact.last_name || '',
          firstNameFurigana: contact.firstNameFurigana || contact.first_name_furigana || '',
          lastNameFurigana: contact.lastNameFurigana || contact.last_name_furigana || '',
          relationship: contact.relationship || '',
          tel: contact.tel || '',
          address: contact.address || '',
          notes: contact.notes || '',
          priority: contact.priority || 1,
        }))
      : [createEmptyEmergencyContact()],
    disabilityInfo: {
      disabilityOrDiseaseName:
        initialData.disability_status?.disabilityOrDiseaseName ||
        initialData.disability_status?.disability_or_disease_name ||
        '',
      livelihoodProtection:
        initialData.disability_status?.livelihoodProtection ||
        initialData.disability_status?.livelihood_protection ||
        '',
      specialRemarks:
        initialData.disability_status?.specialRemarks || initialData.disability_status?.special_remarks || '',
    },
    disabilityDetails: initialData.disability_status?.details?.length
      ? initialData.disability_status.details.map((detail) => ({
          category: detail.category || '',
          gradeOrLevel: detail.gradeOrLevel || detail.grade_or_level || '',
          physicalDisabilityType: detail.physicalDisabilityType || detail.physical_disability_type || '',
          physicalDisabilityTypeOtherText:
            detail.physicalDisabilityTypeOtherText || detail.physical_disability_type_other_text || '',
          applicationStatus: detail.applicationStatus || detail.application_status || '',
        }))
      : [createEmptyDisabilityDetail()],
  };
}
