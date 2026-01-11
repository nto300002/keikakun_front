import { http } from './http';

// ============================================
// 型定義
// ============================================

// 家族構成
export interface FamilyMember {
  id: number;
  welfare_recipient_id: string;
  name: string;
  relationship: string;
  household: 'same' | 'separate';
  ones_health: string;
  remarks?: string;
  family_structure_chart?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMemberInput {
  name: string;
  relationship: string;
  household: 'same' | 'separate';
  ones_health: string;
  remarks?: string;
  family_structure_chart?: string;
}

// 福祉サービス利用歴
export interface ServiceHistory {
  id: number;
  welfare_recipient_id: string;
  office_name: string;
  starting_day: string;
  amount_used: string;
  service_name: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceHistoryInput {
  office_name: string;
  starting_day: string;
  amount_used: string;
  service_name: string;
}

// 医療基本情報
export interface MedicalInfo {
  id: number;
  welfare_recipient_id: string;
  medical_care_insurance: 'national_health_insurance' | 'mutual_aid' | 'social_insurance' | 'livelihood_protection' | 'other';
  medical_care_insurance_other_text?: string;
  aiding: 'none' | 'subsidized' | 'full_exemption';
  history_of_hospitalization_in_the_past_2_years: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalInfoInput {
  medical_care_insurance: 'national_health_insurance' | 'mutual_aid' | 'social_insurance' | 'livelihood_protection' | 'other';
  medical_care_insurance_other_text?: string;
  aiding: 'none' | 'subsidized' | 'full_exemption';
  history_of_hospitalization_in_the_past_2_years: boolean;
}

// 通院歴
export interface HospitalVisit {
  id: number;
  medical_matters_id: number;
  disease: string;
  frequency_of_hospital_visits: string;
  symptoms: string;
  medical_institution: string;
  doctor: string;
  tel: string;
  taking_medicine: boolean;
  date_started?: string;
  date_ended?: string;
  special_remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalVisitInput {
  disease: string;
  frequency_of_hospital_visits: string;
  symptoms: string;
  medical_institution: string;
  doctor: string;
  tel: string;
  taking_medicine: boolean;
  date_started?: string;
  date_ended?: string;
  special_remarks?: string;
}

// 就労関係
export interface Employment {
  id: number;
  welfare_recipient_id: string;
  created_by_staff_id: string;
  work_conditions: 'general_employment' | 'part_time' | 'transition_support' | 'continuous_support_a' | 'continuous_support_b' | 'main_employment' | 'other';
  regular_or_part_time_job: boolean;
  employment_support: boolean;
  work_experience_in_the_past_year: boolean;
  suspension_of_work: boolean;
  qualifications?: string;
  main_places_of_employment?: string;
  general_employment_request: boolean;
  desired_job?: string;
  special_remarks?: string;
  work_outside_the_facility: 'hope' | 'not_hope' | 'undecided';
  special_note_about_working_outside_the_facility?: string;
  desired_tasks_on_asobe?: string;
  no_employment_experience: boolean;
  attended_job_selection_office: boolean;
  received_employment_assessment: boolean;
  employment_other_experience: boolean;
  employment_other_text?: string;
}

export interface EmploymentInput {
  work_conditions: 'general_employment' | 'part_time' | 'transition_support' | 'continuous_support_a' | 'continuous_support_b' | 'main_employment' | 'other';
  regular_or_part_time_job: boolean;
  employment_support: boolean;
  work_experience_in_the_past_year: boolean;
  suspension_of_work: boolean;
  qualifications?: string;
  main_places_of_employment?: string;
  general_employment_request: boolean;
  desired_job?: string;
  special_remarks?: string;
  work_outside_the_facility: 'hope' | 'not_hope' | 'undecided';
  special_note_about_working_outside_the_facility?: string;
  desired_tasks_on_asobe?: string;
  no_employment_experience: boolean;
  attended_job_selection_office: boolean;
  received_employment_assessment: boolean;
  employment_other_experience: boolean;
  employment_other_text?: string;
}

// 課題分析
export interface IssueAnalysis {
  id: number;
  welfare_recipient_id: string;
  created_by_staff_id: string;
  what_i_like_to_do?: string;
  im_not_good_at?: string;
  the_life_i_want?: string;
  the_support_i_want?: string;
  points_to_keep_in_mind_when_providing_support?: string;
  future_dreams?: string;
  other?: string;
}

export interface IssueAnalysisInput {
  what_i_like_to_do?: string;
  im_not_good_at?: string;
  the_life_i_want?: string;
  the_support_i_want?: string;
  points_to_keep_in_mind_when_providing_support?: string;
  future_dreams?: string;
  other?: string;
}

// 全アセスメント情報
export interface AssessmentData {
  family_members: FamilyMember[];
  service_history: ServiceHistory[];
  medical_info?: MedicalInfo;
  hospital_visits: HospitalVisit[];
  employment?: Employment;
  issue_analysis?: IssueAnalysis;
}

// ============================================
// API関数
// ============================================

export const assessmentApi = {
  // ============================================
  // 家族構成
  // ============================================
  familyMembers: {
    list: (recipientId: string): Promise<FamilyMember[]> =>
      http.get<FamilyMember[]>(`/api/v1/recipients/${recipientId}/family-members`),

    create: (recipientId: string, data: FamilyMemberInput): Promise<FamilyMember> =>
      http.post<FamilyMember>(`/api/v1/recipients/${recipientId}/family-members`, data),

    update: (familyMemberId: number, data: FamilyMemberInput): Promise<FamilyMember> =>
      http.patch<FamilyMember>(`/api/v1/family-members/${familyMemberId}`, data),

    delete: (familyMemberId: number): Promise<{ message: string }> =>
      http.delete<{ message: string }>(`/api/v1/family-members/${familyMemberId}`),
  },

  // ============================================
  // 福祉サービス利用歴
  // ============================================
  serviceHistory: {
    list: (recipientId: string): Promise<ServiceHistory[]> =>
      http.get<ServiceHistory[]>(`/api/v1/recipients/${recipientId}/service-history`),

    create: (recipientId: string, data: ServiceHistoryInput): Promise<ServiceHistory> =>
      http.post<ServiceHistory>(`/api/v1/recipients/${recipientId}/service-history`, data),

    update: (historyId: number, data: ServiceHistoryInput): Promise<ServiceHistory> =>
      http.patch<ServiceHistory>(`/api/v1/service-history/${historyId}`, data),

    delete: (historyId: number): Promise<{ message: string }> =>
      http.delete<{ message: string }>(`/api/v1/service-history/${historyId}`),
  },

  // ============================================
  // 医療情報
  // ============================================
  medicalInfo: {
    get: (recipientId: string): Promise<MedicalInfo | null> =>
      http.get<MedicalInfo | null>(`/api/v1/recipients/${recipientId}/medical-info`),

    createOrUpdate: (recipientId: string, data: MedicalInfoInput): Promise<MedicalInfo> =>
      http.put<MedicalInfo>(`/api/v1/recipients/${recipientId}/medical-info`, data),
  },

  hospitalVisits: {
    list: (recipientId: string): Promise<HospitalVisit[]> =>
      http.get<HospitalVisit[]>(`/api/v1/recipients/${recipientId}/hospital-visits`),

    create: (recipientId: string, data: HospitalVisitInput): Promise<HospitalVisit> =>
      http.post<HospitalVisit>(`/api/v1/recipients/${recipientId}/hospital-visits`, data),

    update: (visitId: number, data: HospitalVisitInput): Promise<HospitalVisit> =>
      http.patch<HospitalVisit>(`/api/v1/hospital-visits/${visitId}`, data),

    delete: (visitId: number): Promise<{ message: string }> =>
      http.delete<{ message: string }>(`/api/v1/hospital-visits/${visitId}`),
  },

  // ============================================
  // 就労関係
  // ============================================
  employment: {
    get: (recipientId: string): Promise<Employment | null> =>
      http.get<Employment | null>(`/api/v1/recipients/${recipientId}/employment`),

    createOrUpdate: (recipientId: string, data: EmploymentInput): Promise<Employment> =>
      http.put<Employment>(`/api/v1/recipients/${recipientId}/employment`, data),
  },

  // ============================================
  // 課題分析
  // ============================================
  issueAnalysis: {
    get: (recipientId: string): Promise<IssueAnalysis | null> =>
      http.get<IssueAnalysis | null>(`/api/v1/recipients/${recipientId}/issue-analysis`),

    createOrUpdate: (recipientId: string, data: IssueAnalysisInput): Promise<IssueAnalysis> =>
      http.put<IssueAnalysis>(`/api/v1/recipients/${recipientId}/issue-analysis`, data),
  },

  // ============================================
  // 全アセスメント情報取得
  // ============================================
  getAll: (recipientId: string): Promise<AssessmentData> =>
    http.get<AssessmentData>(`/api/v1/recipients/${recipientId}/assessment`),
};
