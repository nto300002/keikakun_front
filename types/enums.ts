export enum StaffRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  OWNER = 'owner',
}

export enum OfficeType {
  TRANSITION_TO_EMPLOYMENT = 'transition_to_employment',
  TYPE_B_OFFICE = 'type_B_office',
  TYPE_A_OFFICE = 'type_A_office',
}

export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum SupportPlanStep {
  ASSESSMENT = 'assessment',
  DRAFT_PLAN = 'draft_plan',
  STAFF_MEETING = 'staff_meeting',
  FINAL_PLAN_SIGNED = 'final_plan_signed',
  MONITORING = 'monitoring',
}

export enum DeliverableType {
  ASSESSMENT_SHEET = 'assessment_sheet',
  DRAFT_PLAN_PDF = 'draft_plan_pdf',
  STAFF_MEETING_MINUTES = 'staff_meeting_minutes',
  FINAL_PLAN_SIGNED_PDF = 'final_plan_signed_pdf',
  MONITORING_REPORT_PDF = 'monitoring_report_pdf',
}

export enum AssessmentSheetType {
  BASIC_INFO = '1-1.基本情報',
  EMPLOYMENT_INFO = '1-2.就労関係',
  ISSUE_ANALYSIS = '2.課題分析',
}

export enum BillingStatus {
  FREE = 'free',
  EARLY_PAYMENT = 'early_payment',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELING = 'canceling',
  CANCELED = 'canceled',
}
