'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DateDrumPicker from '@/components/ui/DateDrumPicker';

// Basic Information Section
interface BasicInfoData {
  firstName: string;
  lastName: string;
  firstNameFurigana: string;
  lastNameFurigana: string;
  birthDay: string;
  gender: string;
}

// Contact & Address Information Section
interface ContactAddressData {
  address: string;
  formOfResidence: string;
  formOfResidenceOtherText?: string;
  meansOfTransportation: string;
  meansOfTransportationOtherText?: string;
  tel: string;
}

// Emergency Contact Information
interface EmergencyContactData {
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

// Disability & Disease Information Section
interface DisabilityInfoData {
  disabilityOrDiseaseName: string;
  livelihoodProtection: string;
  specialRemarks?: string;
}

// Disability Detail Information
interface DisabilityDetailData {
  category: string;
  gradeOrLevel?: string;
  physicalDisabilityType?: string;
  physicalDisabilityTypeOtherText?: string;
  applicationStatus: string;
}

interface FormData {
  basicInfo: BasicInfoData;
  contactAddress: ContactAddressData;
  emergencyContacts: EmergencyContactData[];
  disabilityInfo: DisabilityInfoData;
  disabilityDetails: DisabilityDetailData[];
}

const INITIAL_FORM_DATA: FormData = {
  basicInfo: {
    firstName: '',
    lastName: '',
    firstNameFurigana: '',
    lastNameFurigana: '',
    birthDay: '',
    gender: '',
  },
  contactAddress: {
    address: '',
    formOfResidence: '',
    formOfResidenceOtherText: '',
    meansOfTransportation: '',
    meansOfTransportationOtherText: '',
    tel: '',
  },
  emergencyContacts: [
    {
      firstName: '',
      lastName: '',
      firstNameFurigana: '',
      lastNameFurigana: '',
      relationship: '',
      tel: '',
      address: '',
      notes: '',
      priority: 1,
    },
  ],
  disabilityInfo: {
    disabilityOrDiseaseName: '',
    livelihoodProtection: '',
    specialRemarks: '',
  },
  disabilityDetails: [
    {
      category: '',
      gradeOrLevel: '',
      physicalDisabilityType: '',
      physicalDisabilityTypeOtherText: '',
      applicationStatus: '',
    },
  ],
};

// Enum options for dropdowns
const GENDER_OPTIONS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
];

const FORM_OF_RESIDENCE_OPTIONS = [
  { value: 'home_with_family', label: '自宅（家族と同居）' },
  { value: 'home_alone', label: '自宅（一人暮らし）' },
  { value: 'group_home', label: 'グループホーム' },
  { value: 'institution', label: '入所施設' },
  { value: 'hospital', label: '病院・医療機関' },
  { value: 'other', label: 'その他' },
];

const MEANS_OF_TRANSPORTATION_OPTIONS = [
  { value: 'walk', label: '徒歩' },
  { value: 'bicycle', label: '自転車' },
  { value: 'motorbike', label: 'バイク・原付' },
  { value: 'car_self', label: '自家用車（自分で運転）' },
  { value: 'car_transport', label: '自家用車（送迎）' },
  { value: 'public_transport', label: '公共交通機関（電車・バス）' },
  { value: 'welfare_transport', label: '福祉輸送サービス' },
  { value: 'other', label: 'その他' },
];

const LIVELIHOOD_PROTECTION_OPTIONS = [
  { value: 'not_receiving', label: 'なし' },
  { value: 'receiving_with_allowance', label: 'あり（他人介護料有り）' },
  { value: 'receiving_without_allowance', label: 'あり（他人介護料無し）' },
  { value: 'applying', label: '申請中' },
  { value: 'planning', label: '申請予定' },
];

const DISABILITY_CATEGORY_OPTIONS = [
  { value: 'physical_handbook', label: '身体障害者手帳' },
  { value: 'intellectual_handbook', label: '療育手帳' },
  { value: 'mental_health_handbook', label: '精神障害者保健福祉手帳' },
  { value: 'disability_basic_pension', label: '障害基礎年金' },
  { value: 'other_disability_pension', label: 'その他の障害年金' },
  { value: 'public_assistance', label: '生活保護' },
];

const APPLICATION_STATUS_OPTIONS = [
  { value: 'acquired', label: '取得済み' },
  { value: 'applying', label: '申請中' },
  { value: 'planning', label: '申請予定' },
  { value: 'not_applicable', label: '該当なし' },
];

const PHYSICAL_DISABILITY_TYPE_OPTIONS = [
  { value: 'visual', label: '視覚障害' },
  { value: 'hearing', label: '聴覚障害' },
  { value: 'limb', label: '肢体不自由' },
  { value: 'internal', label: '内部障害' },
  { value: 'other', label: 'その他' },
];

const RELATIONSHIP_OPTIONS = [
  '父', '母', '配偶者', '子', '兄弟姉妹', '相談支援専門員', 'ケースワーカー', '医療機関', '友人・知人', 'その他'
];

// 等級・レベル選択肢
const GRADE_LEVEL_OPTIONS = {
  physical_handbook: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
    { value: '3', label: '3級' },
    { value: '4', label: '4級' },
    { value: '5', label: '5級' },
    { value: '6', label: '6級' },
  ],
  intellectual_handbook: [
    { value: 'A', label: 'A（重度）' },
    { value: 'B1', label: 'B1（中度）' },
    { value: 'B2', label: 'B2（軽度）' },
    { value: 'C', label: 'C（境界域）' },
  ],
  mental_health_handbook: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
    { value: '3', label: '3級' },
  ],
  disability_basic_pension: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
  ],
  other_disability_pension: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
    { value: '3', label: '3級' },
  ],
  public_assistance: [
    { value: '介護扶助', label: '介護扶助' },
    { value: '医療扶助', label: '医療扶助' },
    { value: '生活扶助', label: '生活扶助' },
    { value: 'その他', label: 'その他' },
  ],
};

export default function UserRegistrationForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const sections = [
    { id: 0, title: '基本情報', description: '氏名・ふりがな・生年月日・性別' },
    { id: 1, title: '連絡先・住所情報', description: '住所・居住形態・交通手段・電話番号' },
    { id: 2, title: '緊急連絡先', description: '緊急時の連絡先情報' },
    { id: 3, title: '障害・疾患情報', description: '障害または疾患名・生活保護受給状況' },
    { id: 4, title: '手帳・年金詳細', description: '各種手帳・年金の詳細情報' },
  ];

  // Progress calculation
  const getProgressPercentage = () => {
    return ((currentSection + 1) / sections.length) * 100;
  };

  // Form validation for each section
  const validateSection = (sectionId: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionId) {
      case 0: // Basic Information
        if (!formData.basicInfo.firstName) newErrors.firstName = '名は必須です';
        if (!formData.basicInfo.lastName) newErrors.lastName = '姓は必須です';
        if (!formData.basicInfo.firstNameFurigana) newErrors.firstNameFurigana = '名（ふりがな）は必須です';
        if (!formData.basicInfo.lastNameFurigana) newErrors.lastNameFurigana = '姓（ふりがな）は必須です';
        if (!formData.basicInfo.birthDay) newErrors.birthDay = '生年月日は必須です';
        if (!formData.basicInfo.gender) newErrors.gender = '性別は必須です';
        break;
      case 1: // Contact & Address
        if (!formData.contactAddress.address) newErrors.address = '住所は必須です';
        if (!formData.contactAddress.formOfResidence) newErrors.formOfResidence = '居住形態は必須です';
        if (!formData.contactAddress.meansOfTransportation) newErrors.meansOfTransportation = '交通手段は必須です';
        if (!formData.contactAddress.tel) newErrors.tel = '電話番号は必須です';
        break;
      case 2: // Emergency Contact
        formData.emergencyContacts.forEach((contact, index) => {
          if (!contact.firstName) newErrors[`emergencyContact${index}FirstName`] = '名は必須です';
          if (!contact.lastName) newErrors[`emergencyContact${index}LastName`] = '姓は必須です';
          if (!contact.tel) newErrors[`emergencyContact${index}Tel`] = '電話番号は必須です';
        });
        break;
      case 3: // Disability Info
        if (!formData.disabilityInfo.disabilityOrDiseaseName) newErrors.disabilityOrDiseaseName = '障害または疾患名は必須です';
        if (!formData.disabilityInfo.livelihoodProtection) newErrors.livelihoodProtection = '生活保護受給状況は必須です';
        break;
      case 4: // Disability Details
        // Optional validation for disability details
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle navigation
  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateSection(currentSection)) {
      return;
    }

    setIsLoading(true);
    try {
      // Import the API client and transformer
      const { welfareRecipientsApi, transformFormDataToBackend } = await import('@/lib/welfare-recipients');

      // Transform form data to backend format
      const registrationData = transformFormDataToBackend(formData);

      // Submit to API
      const response = await welfareRecipientsApi.create(registrationData);

      if (response.success) {
        // Redirect to dashboard on success
        router.push('/dashboard?message=' + encodeURIComponent(response.message));
      } else {
        setErrors({ submit: '登録に失敗しました。もう一度お試しください。' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        setErrors({ submit: error.message || '登録に失敗しました。もう一度お試しください。' });
      } else {
        setErrors({ submit: '登録に失敗しました。もう一度お試しください。' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add emergency contact
  const addEmergencyContact = () => {
    if (formData.emergencyContacts.length < 3) {
      setFormData(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, {
          firstName: '',
          lastName: '',
          firstNameFurigana: '',
          lastNameFurigana: '',
          relationship: '',
          tel: '',
          address: '',
          notes: '',
          priority: prev.emergencyContacts.length + 1,
        }],
      }));
    }
  };

  // Remove emergency contact
  const removeEmergencyContact = (index: number) => {
    if (formData.emergencyContacts.length > 1) {
      setFormData(prev => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
      }));
    }
  };

  // Add disability detail
  const addDisabilityDetail = () => {
    setFormData(prev => ({
      ...prev,
      disabilityDetails: [...prev.disabilityDetails, {
        category: '',
        gradeOrLevel: '',
        physicalDisabilityType: '',
        physicalDisabilityTypeOtherText: '',
        applicationStatus: '',
      }],
    }));
  };

  // Remove disability detail
  const removeDisabilityDetail = (index: number) => {
    if (formData.disabilityDetails.length > 1) {
      setFormData(prev => ({
        ...prev,
        disabilityDetails: prev.disabilityDetails.filter((_, i) => i !== index),
      }));
    }
  };

  // Input handlers
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value },
    }));
  };

  const handleContactAddressChange = (field: keyof ContactAddressData, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactAddress: { ...prev.contactAddress, [field]: value },
    }));
  };

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContactData, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const handleDisabilityInfoChange = (field: keyof DisabilityInfoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      disabilityInfo: { ...prev.disabilityInfo, [field]: value },
    }));
  };

  const handleDisabilityDetailChange = (index: number, field: keyof DisabilityDetailData, value: string) => {
    setFormData(prev => ({
      ...prev,
      disabilityDetails: prev.disabilityDetails.map((detail, i) => {
        if (i === index) {
          const updatedDetail = { ...detail, [field]: value };
          // カテゴリが変更された場合、等級・レベルをリセット
          if (field === 'category') {
            updatedDetail.gradeOrLevel = '';
          }
          return updatedDetail;
        }
        return detail;
      }),
    }));
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">利用者新規登録</h1>
        <p className="text-gray-400">新しい利用者の情報を登録します</p>
      </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center ${index < sections.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                  index <= currentSection
                    ? 'bg-[#10b981] border-[#10b981] text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                {index < sections.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    index < currentSection ? 'bg-[#10b981]' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">{sections[currentSection].title}</h2>
            <p className="text-gray-400 text-sm">{sections[currentSection].description}</p>
          </div>
          <div className="mt-4 bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#10b981] h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-8">
          {currentSection === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    姓 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.lastName}
                    onChange={(e) => handleBasicInfoChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                      errors.lastName ? 'border-red-500' : 'border-[#2a3441]'
                    }`}
                    placeholder="山田"
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.firstName}
                    onChange={(e) => handleBasicInfoChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                      errors.firstName ? 'border-red-500' : 'border-[#2a3441]'
                    }`}
                    placeholder="太郎"
                  />
                  {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    姓（ふりがな） <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.lastNameFurigana}
                    onChange={(e) => handleBasicInfoChange('lastNameFurigana', e.target.value)}
                    className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                      errors.lastNameFurigana ? 'border-red-500' : 'border-[#2a3441]'
                    }`}
                    placeholder="やまだ"
                  />
                  {errors.lastNameFurigana && <p className="text-red-400 text-sm mt-1">{errors.lastNameFurigana}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    名（ふりがな） <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.firstNameFurigana}
                    onChange={(e) => handleBasicInfoChange('firstNameFurigana', e.target.value)}
                    className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                      errors.firstNameFurigana ? 'border-red-500' : 'border-[#2a3441]'
                    }`}
                    placeholder="たろう"
                  />
                  {errors.firstNameFurigana && <p className="text-red-400 text-sm mt-1">{errors.firstNameFurigana}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    生年月日 <span className="text-red-400">*</span>
                  </label>
                  <DateDrumPicker
                    value={formData.basicInfo.birthDay}
                    onChange={(date) => handleBasicInfoChange('birthDay', date)}
                    error={!!errors.birthDay}
                    minYear={1900}
                    maxYear={new Date().getFullYear()}
                  />
                  {errors.birthDay && <p className="text-red-400 text-sm mt-1">{errors.birthDay}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    性別 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.basicInfo.gender}
                    onChange={(e) => handleBasicInfoChange('gender', e.target.value)}
                    className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                      errors.gender ? 'border-red-500' : 'border-[#2a3441]'
                    }`}
                  >
                    <option value="">選択してください</option>
                    {GENDER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">連絡先・住所情報</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  住所 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.contactAddress.address}
                  onChange={(e) => handleContactAddressChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                    errors.address ? 'border-red-500' : 'border-[#2a3441]'
                  }`}
                  placeholder="例：東京都新宿区西新宿1-1-1"
                />
                {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  居住形態 <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.contactAddress.formOfResidence}
                  onChange={(e) => handleContactAddressChange('formOfResidence', e.target.value)}
                  className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                    errors.formOfResidence ? 'border-red-500' : 'border-[#2a3441]'
                  }`}
                >
                  <option value="">選択してください</option>
                  {FORM_OF_RESIDENCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors.formOfResidence && <p className="text-red-400 text-sm mt-1">{errors.formOfResidence}</p>}
              </div>

              {formData.contactAddress.formOfResidence === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">その他詳細</label>
                  <input
                    type="text"
                    value={formData.contactAddress.formOfResidenceOtherText || ''}
                    onChange={(e) => handleContactAddressChange('formOfResidenceOtherText', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    placeholder="詳細を入力してください"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  交通手段 <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.contactAddress.meansOfTransportation}
                  onChange={(e) => handleContactAddressChange('meansOfTransportation', e.target.value)}
                  className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                    errors.meansOfTransportation ? 'border-red-500' : 'border-[#2a3441]'
                  }`}
                >
                  <option value="">選択してください</option>
                  {MEANS_OF_TRANSPORTATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors.meansOfTransportation && <p className="text-red-400 text-sm mt-1">{errors.meansOfTransportation}</p>}
              </div>

              {formData.contactAddress.meansOfTransportation === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">その他詳細</label>
                  <input
                    type="text"
                    value={formData.contactAddress.meansOfTransportationOtherText || ''}
                    onChange={(e) => handleContactAddressChange('meansOfTransportationOtherText', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    placeholder="詳細を入力してください"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  電話番号 <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactAddress.tel}
                  onChange={(e) => handleContactAddressChange('tel', e.target.value)}
                  className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                    errors.tel ? 'border-red-500' : 'border-[#2a3441]'
                  }`}
                  placeholder="例：090-1234-5678"
                />
                {errors.tel && <p className="text-red-400 text-sm mt-1">{errors.tel}</p>}
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">緊急連絡先情報</h3>
                <button
                  onClick={addEmergencyContact}
                  disabled={formData.emergencyContacts.length >= 3}
                  className="bg-[#10b981] hover:bg-[#0f9f6e] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + 連絡先を追加
                </button>
              </div>

              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="border border-[#2a3441] rounded-lg p-6 relative">
                  {formData.emergencyContacts.length > 1 && (
                    <button
                      onClick={() => removeEmergencyContact(index)}
                      className="absolute top-4 right-4 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded text-sm transition-colors"
                    >
                      削除
                    </button>
                  )}

                  <h4 className="text-md font-medium text-white mb-4">緊急連絡先 {index + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        姓 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={contact.lastName}
                        onChange={(e) => handleEmergencyContactChange(index, 'lastName', e.target.value)}
                        className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                          errors[`emergencyContact${index}LastName`] ? 'border-red-500' : 'border-[#2a3441]'
                        }`}
                        placeholder="田中"
                      />
                      {errors[`emergencyContact${index}LastName`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}LastName`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        名 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={contact.firstName}
                        onChange={(e) => handleEmergencyContactChange(index, 'firstName', e.target.value)}
                        className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                          errors[`emergencyContact${index}FirstName`] ? 'border-red-500' : 'border-[#2a3441]'
                        }`}
                        placeholder="花子"
                      />
                      {errors[`emergencyContact${index}FirstName`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}FirstName`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">姓（ふりがな）</label>
                      <input
                        type="text"
                        value={contact.lastNameFurigana}
                        onChange={(e) => handleEmergencyContactChange(index, 'lastNameFurigana', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        placeholder="たなか"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">名（ふりがな）</label>
                      <input
                        type="text"
                        value={contact.firstNameFurigana}
                        onChange={(e) => handleEmergencyContactChange(index, 'firstNameFurigana', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        placeholder="はなこ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">続柄・関係性</label>
                      <select
                        value={contact.relationship}
                        onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      >
                        <option value="">選択してください</option>
                        {RELATIONSHIP_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        電話番号 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contact.tel}
                        onChange={(e) => handleEmergencyContactChange(index, 'tel', e.target.value)}
                        className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                          errors[`emergencyContact${index}Tel`] ? 'border-red-500' : 'border-[#2a3441]'
                        }`}
                        placeholder="例：090-1234-5678"
                      />
                      {errors[`emergencyContact${index}Tel`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}Tel`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">住所</label>
                    <input
                      type="text"
                      value={contact.address || ''}
                      onChange={(e) => handleEmergencyContactChange(index, 'address', e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      placeholder="住所（任意）"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">備考</label>
                    <textarea
                      value={contact.notes || ''}
                      onChange={(e) => handleEmergencyContactChange(index, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      placeholder="備考（任意）"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">障害・疾患情報</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  障害または疾患名 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.disabilityInfo.disabilityOrDiseaseName}
                  onChange={(e) => handleDisabilityInfoChange('disabilityOrDiseaseName', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                    errors.disabilityOrDiseaseName ? 'border-red-500' : 'border-[#2a3441]'
                  }`}
                  placeholder="例：統合失調症、知的障害、身体障害など"
                />
                {errors.disabilityOrDiseaseName && <p className="text-red-400 text-sm mt-1">{errors.disabilityOrDiseaseName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  生活保護受給状況 <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.disabilityInfo.livelihoodProtection}
                  onChange={(e) => handleDisabilityInfoChange('livelihoodProtection', e.target.value)}
                  className={`w-full px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                    errors.livelihoodProtection ? 'border-red-500' : 'border-[#2a3441]'
                  }`}
                >
                  <option value="">選択してください</option>
                  {LIVELIHOOD_PROTECTION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors.livelihoodProtection && <p className="text-red-400 text-sm mt-1">{errors.livelihoodProtection}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">特記事項</label>
                <textarea
                  value={formData.disabilityInfo.specialRemarks || ''}
                  onChange={(e) => handleDisabilityInfoChange('specialRemarks', e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                  placeholder="手帳情報以外の重要な障害特性、配慮事項、医療的ケアの必要性等（2000文字以内）"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {(formData.disabilityInfo.specialRemarks || '').length}/2000文字
                </div>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">手帳・年金詳細情報</h3>
                <button
                  onClick={addDisabilityDetail}
                  className="bg-[#10b981] hover:bg-[#0f9f6e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + 手帳・年金情報を追加
                </button>
              </div>

              {formData.disabilityDetails.map((detail, index) => (
                <div key={index} className="border border-[#2a3441] rounded-lg p-6 relative">
                  {formData.disabilityDetails.length > 1 && (
                    <button
                      onClick={() => removeDisabilityDetail(index)}
                      className="absolute top-4 right-4 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded text-sm transition-colors"
                    >
                      削除
                    </button>
                  )}

                  <h4 className="text-md font-medium text-white mb-4">手帳・年金情報 {index + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">カテゴリ</label>
                      <select
                        value={detail.category}
                        onChange={(e) => handleDisabilityDetailChange(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      >
                        <option value="">選択してください</option>
                        {DISABILITY_CATEGORY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">等級・レベル</label>
                      <select
                        value={detail.gradeOrLevel || ''}
                        onChange={(e) => handleDisabilityDetailChange(index, 'gradeOrLevel', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      >
                        <option value="">選択してください</option>
                        {detail.category && GRADE_LEVEL_OPTIONS[detail.category as keyof typeof GRADE_LEVEL_OPTIONS]?.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">申請状況</label>
                      <select
                        value={detail.applicationStatus}
                        onChange={(e) => handleDisabilityDetailChange(index, 'applicationStatus', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      >
                        <option value="">選択してください</option>
                        {APPLICATION_STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    {detail.category === 'physical_handbook' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">身体障害種別</label>
                          <select
                            value={detail.physicalDisabilityType || ''}
                            onChange={(e) => handleDisabilityDetailChange(index, 'physicalDisabilityType', e.target.value)}
                            className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                          >
                            <option value="">選択してください</option>
                            {PHYSICAL_DISABILITY_TYPE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>

                        {detail.physicalDisabilityType === 'other' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">その他詳細</label>
                            <input
                              type="text"
                              value={detail.physicalDisabilityTypeOtherText || ''}
                              onChange={(e) => handleDisabilityDetailChange(index, 'physicalDisabilityTypeOtherText', e.target.value)}
                              className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                              placeholder="詳細を入力してください"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#2a3441]">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="px-6 py-2 text-gray-400 hover:text-white disabled:cursor-not-allowed transition-colors"
            >
              前へ
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-[#2a3441] text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-colors"
              >
                キャンセル
              </button>

              {currentSection < sections.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#10b981] hover:bg-[#0f9f6e] text-white rounded-lg font-medium transition-colors"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#10b981] hover:bg-[#0f9f6e] disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  登録完了
                </button>
              )}
            </div>
          </div>
        </div>
    </>
  );
}