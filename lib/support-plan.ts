import { http } from './http';

export interface PlanStatus {
  id: string;
  step_type: string;
  completed: boolean;
  completed_at: string | null;
  pdf_url: string | null;
  pdf_filename: string | null;
  deliverable_id?: string | null;
}

export interface PlanCycle {
  id: string;
  cycle_number: number;
  is_latest_cycle: boolean;
  plan_cycle_start_date: string | null;
  monitoring_deadline: number | null;
  statuses: PlanStatus[];
}

export interface SupportPlanCyclesResponse {
  cycles: PlanCycle[];
}

// step_type から deliverable_type へのマッピング
const STEP_TO_DELIVERABLE_MAP: Record<string, string> = {
  assessment: 'assessment_sheet',
  monitoring: 'monitoring_report_pdf',
  draft_plan: 'draft_plan_pdf',
  staff_meeting: 'staff_meeting_minutes',
  final_plan_signed: 'final_plan_signed_pdf',
};

export const supportPlanApi = {
  /**
   * Get all plan cycles for a specific welfare recipient
   */
  getCycles: (recipientId: string): Promise<SupportPlanCyclesResponse> =>
    http.get<SupportPlanCyclesResponse>(`/api/v1/support-plans/${recipientId}/cycles`),

  /**
   * Upload a plan deliverable (PDF)
   */
  uploadDeliverable: (
    recipientId: string,
    cycleId: string,
    stepType: string,
    file: File
  ): Promise<{ success: boolean; message: string }> => {
    const deliverableType = STEP_TO_DELIVERABLE_MAP[stepType] || stepType;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('plan_cycle_id', cycleId);
    formData.append('deliverable_type', deliverableType);

    return http.postFormData<{ success: boolean; message: string }>(
      '/api/v1/support-plans/plan-deliverables',
      formData
    );
  },

  /**
   * Re-upload a plan deliverable (PUT)
   */
  reuploadDeliverable: (deliverableId: string, file: File): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    return http.putFormData<{ success: boolean; message: string }>(
      `/api/v1/support-plans/deliverables/${deliverableId}`,
      formData
    );
  },

  /**
   * Delete a plan deliverable
   */
  deleteDeliverable: (deliverableId: string): Promise<{ message: string }> =>
    http.delete<{ message: string }>(`/api/v1/support-plans/deliverables/${deliverableId}`),

  /**
   * Update monitoring deadline for a specific cycle
   */
  updateMonitoringDeadline: (cycleId: string, deadlineDays: number): Promise<PlanCycle> => {
    return http.patch<PlanCycle>(`/api/v1/support-plans/cycles/${cycleId}/monitoring-deadline`, {
      monitoring_deadline: deadlineDays,
    });
  },
};
