import type { RecipientFormData } from './recipientFormTypes';

export type RecipientFormValidationMode = 'registration' | 'edit';

export function validateRecipientFormSection(
  formData: RecipientFormData,
  sectionId: number,
  mode: RecipientFormValidationMode,
): Record<string, string> {
  const newErrors: Record<string, string> = {};

  switch (sectionId) {
    case 0:
      if (!formData.basicInfo.firstName) newErrors.firstName = '名は必須です';
      if (!formData.basicInfo.lastName) newErrors.lastName = '姓は必須です';
      if (!formData.basicInfo.firstNameFurigana) newErrors.firstNameFurigana = '名（ふりがな）は必須です';
      if (!formData.basicInfo.lastNameFurigana) newErrors.lastNameFurigana = '姓（ふりがな）は必須です';
      if (!formData.basicInfo.birthDay) newErrors.birthDay = '生年月日は必須です';
      if (!formData.basicInfo.gender) newErrors.gender = '性別は必須です';
      break;
    case 1:
      if (!formData.contactAddress.address) newErrors.address = '住所は必須です';
      if (!formData.contactAddress.formOfResidence) newErrors.formOfResidence = '居住形態は必須です';
      if (!formData.contactAddress.meansOfTransportation) newErrors.meansOfTransportation = '交通手段は必須です';
      if (!formData.contactAddress.tel) newErrors.tel = '電話番号は必須です';
      break;
    case 2:
      formData.emergencyContacts.forEach((contact, index) => {
        if (!contact.firstName) {
          newErrors[`emergencyContact${index}FirstName`] =
            mode === 'registration' ? '緊急連絡先 名は必須です' : '名は必須です';
        }
        if (!contact.lastName) {
          newErrors[`emergencyContact${index}LastName`] =
            mode === 'registration' ? '緊急連絡先 姓は必須です' : '姓は必須です';
        }
        if (mode === 'registration') {
          if (!contact.firstNameFurigana) {
            newErrors[`emergencyContact${index}FirstNameFurigana`] = '緊急連絡先 名（ふりがな）は必須です';
          }
          if (!contact.lastNameFurigana) {
            newErrors[`emergencyContact${index}LastNameFurigana`] = '緊急連絡先 姓（ふりがな）は必須です';
          }
        }
        if (!contact.tel) {
          newErrors[`emergencyContact${index}Tel`] =
            mode === 'registration' ? '緊急連絡先 電話番号は必須です' : '電話番号は必須です';
        }
      });
      break;
    case 3:
      if (!formData.disabilityInfo.disabilityOrDiseaseName) {
        newErrors.disabilityOrDiseaseName = '障害または疾患名は必須です';
      }
      if (!formData.disabilityInfo.livelihoodProtection) {
        newErrors.livelihoodProtection = '生活保護受給状況は必須です';
      }
      break;
    case 4:
      break;
  }

  return newErrors;
}
