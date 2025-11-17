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

    console.log('=== uploadDeliverable API Call ===');
    console.log('recipientId:', recipientId);
    console.log('cycleId:', cycleId);
    console.log('stepType (from UI):', stepType);
    console.log('deliverableType (mapped):', deliverableType);
    console.log('file:', file.name, file.type, file.size);
    console.log('STEP_TO_DELIVERABLE_MAP:', STEP_TO_DELIVERABLE_MAP);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('plan_cycle_id', cycleId);
    formData.append('deliverable_type', deliverableType);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    console.log('API URL:', `${API_BASE_URL}/api/v1/support-plans/plan-deliverables`);

    // Cookieで認証されるため、credentials: 'include'を追加
    return fetch(`${API_BASE_URL}/api/v1/support-plans/plan-deliverables`, {
      method: 'POST',
      credentials: 'include', // Cookie自動送信
      body: formData,
    }).then(async (res) => {
      console.log('Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Response error body:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error:', errorJson);
        } catch {
          console.error('Could not parse error as JSON');
        }
        throw new Error(`アップロードに失敗しました: ${res.status} ${res.statusText}`);
      }

      const responseData = await res.json();
      console.log('Response data:', responseData);
      return responseData;
    });
  },

  /**
   * Re-upload a plan deliverable (PUT)
   */
  reuploadDeliverable: (deliverableId: string, file: File): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Cookieで認証されるため、credentials: 'include'を追加
    return fetch(`${API_BASE_URL}/api/v1/support-plans/deliverables/${deliverableId}`, {
      method: 'PUT',
      credentials: 'include', // Cookie自動送信
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error('再アップロードに失敗しました');
      return res.json();
    });
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
