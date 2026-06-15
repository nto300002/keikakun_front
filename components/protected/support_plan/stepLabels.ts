export const SUPPORT_PLAN_STEP_LABELS = {
  assessment: 'アセスメント',
  draft_plan: '個別支援計画書 原案',
  staff_meeting: '担当者会議',
  final_plan_signed: '個別支援計画書 本案',
  monitoring: 'モニタリング',
} as const;

export type SupportPlanStepType = keyof typeof SUPPORT_PLAN_STEP_LABELS;

export function getSupportPlanStepLabel(stepType: string) {
  return SUPPORT_PLAN_STEP_LABELS[stepType as SupportPlanStepType] ?? stepType;
}
