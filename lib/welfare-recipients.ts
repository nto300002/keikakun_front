import { http } from './http';

// Types matching the backend schemas
export interface UserRegistrationRequest {
  basic_info: {
    firstName: string;
    lastName: string;
    firstNameFurigana: string;
    lastNameFurigana: string;
    birthDay: string;
    gender: string;
  };
  contact_address: {
    address: string;
    formOfResidence: string;
    formOfResidenceOtherText?: string;
    meansOfTransportation: string;
    meansOfTransportationOtherText?: string;
    tel: string;
  };
  emergency_contacts: {
    firstName: string;
    lastName: string;
    firstNameFurigana: string;
    lastNameFurigana: string;
    relationship: string;
    tel: string;
    address?: string;
    notes?: string;
    priority: number;
  }[];
  disability_info: {
    disabilityOrDiseaseName: string;
    livelihoodProtection: string;
    specialRemarks?: string;
  };
  disability_details: {
    category: string;
    gradeOrLevel?: string;
    physicalDisabilityType?: string;
    physicalDisabilityTypeOtherText?: string;
    applicationStatus: string;
  }[];
}

export interface UserRegistrationResponse {
  success: boolean;
  message: string;
  recipient_id: string;
  support_plan_created: boolean;
}

export interface EmergencyContact {
  id: number;
  first_name: string;
  last_name: string;
  first_name_furigana: string;
  last_name_furigana: string;
  relationship: string;
  tel: string;
  address?: string;
  notes?: string;
  priority: number;
}

export interface ServiceRecipientDetail {
  id: number;
  welfare_recipient_id: string;
  address: string;
  form_of_residence: string;
  form_of_residence_other_text?: string;
  means_of_transportation: string;
  means_of_transportation_other_text?: string;
  tel: string;
  emergency_contacts: EmergencyContact[];
}

export interface DisabilityDetail {
  id: number;
  disability_status_id: number;
  category: string;
  grade_or_level?: string;
  physical_disability_type?: string;
  physical_disability_type_other_text?: string;
  application_status: string;
}

export interface DisabilityStatus {
  id: number;
  welfare_recipient_id: string;
  disability_or_disease_name: string;
  livelihood_protection: string;
  special_remarks?: string;
  details: DisabilityDetail[];
}

export interface WelfareRecipient {
  id: string;
  first_name: string;
  last_name: string;
  first_name_furigana: string;
  last_name_furigana: string;
  birth_day: string;
  gender: string;
  detail?: ServiceRecipientDetail;
  disability_status?: DisabilityStatus;
}

export interface WelfareRecipientsListResponse {
  recipients: WelfareRecipient[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface RepairSupportPlanResponse {
  success: boolean;
  message: string;
  recipient_id: string;
}

// Transform frontend form data to backend format
export const transformFormDataToBackend = (formData: any): UserRegistrationRequest => {
  return {
    basic_info: {
      firstName: formData.basicInfo.firstName,
      lastName: formData.basicInfo.lastName,
      firstNameFurigana: formData.basicInfo.firstNameFurigana,
      lastNameFurigana: formData.basicInfo.lastNameFurigana,
      birthDay: formData.basicInfo.birthDay,
      gender: formData.basicInfo.gender,
    },
    contact_address: {
      address: formData.contactAddress.address,
      formOfResidence: formData.contactAddress.formOfResidence,
      formOfResidenceOtherText: formData.contactAddress.formOfResidenceOtherText,
      meansOfTransportation: formData.contactAddress.meansOfTransportation,
      meansOfTransportationOtherText: formData.contactAddress.meansOfTransportationOtherText,
      tel: formData.contactAddress.tel,
    },
    emergency_contacts: formData.emergencyContacts.map((contact: any) => ({
      firstName: contact.firstName,
      lastName: contact.lastName,
      firstNameFurigana: contact.firstNameFurigana,
      lastNameFurigana: contact.lastNameFurigana,
      relationship: contact.relationship,
      tel: contact.tel,
      address: contact.address,
      notes: contact.notes,
      priority: contact.priority,
    })),
    disability_info: {
      disabilityOrDiseaseName: formData.disabilityInfo.disabilityOrDiseaseName,
      livelihoodProtection: formData.disabilityInfo.livelihoodProtection,
      specialRemarks: formData.disabilityInfo.specialRemarks,
    },
    disability_details: formData.disabilityDetails.map((detail: any) => ({
      category: detail.category,
      gradeOrLevel: detail.gradeOrLevel || null,
      physicalDisabilityType: detail.physicalDisabilityType || null,
      physicalDisabilityTypeOtherText: detail.physicalDisabilityTypeOtherText || null,
      applicationStatus: detail.applicationStatus,
    })),
  };
};

// API functions
export const welfareRecipientsApi = {
  /**
   * Create new welfare recipient with comprehensive data
   */
  create: (registrationData: UserRegistrationRequest): Promise<UserRegistrationResponse> =>
    http.post<UserRegistrationResponse>('/api/v1/welfare-recipients/', registrationData),

  /**
   * Get list of welfare recipients for the current staff's office
   */
  list: (params?: { skip?: number; limit?: number; search?: string }): Promise<WelfareRecipientsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/v1/welfare-recipients/?${queryString}` : '/api/v1/welfare-recipients/';

    return http.get<WelfareRecipientsListResponse>(endpoint);
  },

  /**
   * Get a specific welfare recipient by ID
   */
  get: (recipientId: string): Promise<WelfareRecipient> =>
    http.get<WelfareRecipient>(`/api/v1/welfare-recipients/${recipientId}`),

  /**
   * Update welfare recipient with comprehensive data
   */
  update: (recipientId: string, registrationData: UserRegistrationRequest): Promise<WelfareRecipient> =>
    http.put<WelfareRecipient>(`/api/v1/welfare-recipients/${recipientId}`, registrationData),

  /**
   * Delete welfare recipient and all related data
   */
  delete: (recipientId: string): Promise<{ message: string }> =>
    http.delete<{ message: string }>(`/api/v1/welfare-recipients/${recipientId}`),

  /**
   * Repair/recreate support plan data for a welfare recipient
   */
  repairSupportPlan: (recipientId: string): Promise<RepairSupportPlanResponse> =>
    http.post<RepairSupportPlanResponse>(`/api/v1/welfare-recipients/${recipientId}/repair-support-plan`, {}),
};