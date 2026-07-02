import type {
  BasicInfoData,
  ContactAddressData,
  DisabilityDetailData,
  DisabilityInfoData,
  EmergencyContactData,
  RecipientFormData,
} from './recipientFormTypes';

export type RecipientFormMode = 'registration' | 'edit';

export type RecipientFormErrors = Record<string, string>;

export interface RecipientFormHandlers {
  handleBasicInfoChange: (field: keyof BasicInfoData, value: string) => void;
  handleContactAddressChange: (field: keyof ContactAddressData, value: string) => void;
  handleEmergencyContactChange: (index: number, field: keyof EmergencyContactData, value: string) => void;
  handleDisabilityInfoChange: (field: keyof DisabilityInfoData, value: string) => void;
  handleDisabilityDetailChange: (index: number, field: keyof DisabilityDetailData, value: string) => void;
}

export interface RecipientFormSectionBaseProps extends RecipientFormHandlers {
  formData: RecipientFormData;
  errors: RecipientFormErrors;
}
