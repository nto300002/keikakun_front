import { http } from './http';
import {
  PlanDeliverableListResponse,
  PlanDeliverableSearchParams,
} from '@/types/pdf-deliverable';

export const pdfDeliverablesApi = {
  /**
   * PDF一覧を取得
   */
  async getList(params: PlanDeliverableSearchParams): Promise<PlanDeliverableListResponse> {
    console.log('[DEBUG] pdfDeliverablesApi.getList called with params:', params);

    const searchParams = new URLSearchParams();

    // 必須パラメータ
    searchParams.append('office_id', params.office_id);

    // オプショナルパラメータ
    if (params.search) searchParams.append('search', params.search);
    if (params.recipient_ids) searchParams.append('recipient_ids', params.recipient_ids);
    if (params.deliverable_types) searchParams.append('deliverable_types', params.deliverable_types);
    if (params.date_from) searchParams.append('date_from', params.date_from);
    if (params.date_to) searchParams.append('date_to', params.date_to);
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.sort_order) searchParams.append('sort_order', params.sort_order);
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/support-plans/plan-deliverables?${searchParams.toString()}`;
    console.log('[DEBUG] Requesting endpoint:', endpoint);

    const response = await http.get<PlanDeliverableListResponse>(endpoint);
    console.log('[DEBUG] Response received:', response);
    return response;
  },

  /**
   * PDFダウンロードURLを取得
   */
  async getDownloadUrl(deliverableId: number): Promise<{ presigned_url: string }> {
    const response = await http.get<{ presigned_url: string }>(
      `/api/v1/plan-deliverables/${deliverableId}/download`
    );
    return response;
  },

  /**
   * PDFを削除
   */
  async delete(deliverableId: number): Promise<void> {
    await http.delete(`/api/v1/plan-deliverables/${deliverableId}`);
  },
};
