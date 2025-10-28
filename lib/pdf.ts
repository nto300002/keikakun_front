import { http } from './http';
import { PdfListResponse, PdfListParams } from '@/types/pdf';

export const pdfApi = {
  /**
   * Get list of PDFs with filtering and pagination
   */
  getList: (params: PdfListParams = {}): Promise<PdfListResponse> => {
    const queryParams = new URLSearchParams();

    // 必須パラメータ
    if (params.office_id) {
      queryParams.set('office_id', params.office_id);
    }

    if (params.skip !== undefined) queryParams.set('skip', params.skip.toString());
    if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.recipient_id) queryParams.set('recipient_ids', params.recipient_id);
    if (params.deliverable_type) queryParams.set('deliverable_types', params.deliverable_type);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/support-plans/plan-deliverables${queryString ? `?${queryString}` : ''}`;

    return http.get<PdfListResponse>(endpoint);
  },

  /**
   * Delete a PDF
   */
  deletePdf: (deliverableId: string): Promise<{ message: string }> =>
    http.delete<{ message: string }>(`/api/v1/support-plans/deliverables/${deliverableId}`),
};
