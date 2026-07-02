import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

import {
  addDisabilityDetailToForm,
  addEmergencyContactToForm,
  changeDisabilityDetailField,
  removeDisabilityDetailFromForm,
  removeEmergencyContactFromForm,
  updateBasicInfoField,
  updateContactAddressField,
  updateDisabilityInfoField,
  updateEmergencyContactField,
} from './recipientFormState';
import type {
  BasicInfoData,
  ContactAddressData,
  DisabilityDetailData,
  DisabilityInfoData,
  EmergencyContactData,
  RecipientFormData,
} from './recipientFormTypes';

interface RecipientFormState<T extends RecipientFormData | null> {
  formData: T;
  setFormData: Dispatch<SetStateAction<T>>;
  addEmergencyContact: () => void;
  removeEmergencyContact: (index: number) => void;
  addDisabilityDetail: () => void;
  removeDisabilityDetail: (index: number) => void;
  handleBasicInfoChange: (field: keyof BasicInfoData, value: string) => void;
  handleContactAddressChange: (field: keyof ContactAddressData, value: string) => void;
  handleEmergencyContactChange: (index: number, field: keyof EmergencyContactData, value: string) => void;
  handleDisabilityInfoChange: (field: keyof DisabilityInfoData, value: string) => void;
  handleDisabilityDetailChange: (index: number, field: keyof DisabilityDetailData, value: string) => void;
}

export function useRecipientFormState<T extends RecipientFormData | null>(
  initialFormData: T,
): RecipientFormState<T> {
  const [formData, setFormData] = useState<T>(initialFormData);

  const updateFormData = useCallback((updater: (current: RecipientFormData) => RecipientFormData) => {
    setFormData((current) => (current ? (updater(current) as T) : current));
  }, []);

  return {
    formData,
    setFormData,
    addEmergencyContact: () => updateFormData(addEmergencyContactToForm),
    removeEmergencyContact: (index: number) =>
      updateFormData((current) => removeEmergencyContactFromForm(current, index)),
    addDisabilityDetail: () => updateFormData(addDisabilityDetailToForm),
    removeDisabilityDetail: (index: number) =>
      updateFormData((current) => removeDisabilityDetailFromForm(current, index)),
    handleBasicInfoChange: (field: keyof BasicInfoData, value: string) =>
      updateFormData((current) => updateBasicInfoField(current, field, value)),
    handleContactAddressChange: (field: keyof ContactAddressData, value: string) =>
      updateFormData((current) => updateContactAddressField(current, field, value)),
    handleEmergencyContactChange: (index: number, field: keyof EmergencyContactData, value: string) =>
      updateFormData((current) => updateEmergencyContactField(current, index, field, value)),
    handleDisabilityInfoChange: (field: keyof DisabilityInfoData, value: string) =>
      updateFormData((current) => updateDisabilityInfoField(current, field, value)),
    handleDisabilityDetailChange: (index: number, field: keyof DisabilityDetailData, value: string) =>
      updateFormData((current) => changeDisabilityDetailField(current, index, field, value)),
  };
}
