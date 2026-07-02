export interface BasicInfoData {
  firstName: string;
  lastName: string;
  firstNameFurigana: string;
  lastNameFurigana: string;
  birthDay: string;
  gender: string;
}

export interface ContactAddressData {
  address: string;
  formOfResidence: string;
  formOfResidenceOtherText?: string;
  meansOfTransportation: string;
  meansOfTransportationOtherText?: string;
  tel: string;
}

export interface EmergencyContactData {
  firstName: string;
  lastName: string;
  firstNameFurigana: string;
  lastNameFurigana: string;
  relationship: string;
  tel: string;
  address?: string;
  notes?: string;
  priority: number;
}

export interface DisabilityInfoData {
  disabilityOrDiseaseName: string;
  livelihoodProtection: string;
  specialRemarks?: string;
}

export interface DisabilityDetailData {
  category: string;
  gradeOrLevel?: string;
  physicalDisabilityType?: string;
  physicalDisabilityTypeOtherText?: string;
  applicationStatus: string;
}

export interface RecipientFormData {
  basicInfo: BasicInfoData;
  contactAddress: ContactAddressData;
  emergencyContacts: EmergencyContactData[];
  disabilityInfo: DisabilityInfoData;
  disabilityDetails: DisabilityDetailData[];
}

export type RecipientFormSectionId = 0 | 1 | 2 | 3 | 4;

export interface RecipientFormSection {
  id: RecipientFormSectionId;
  title: string;
  description: string;
}
