import type {
  InquiryFilterParams,
  InquiryPriority,
  InquiryStatus,
} from '@/types/inquiry';

const API_V1_PREFIX = '/api/v1';

export interface InquiryListQueryParams extends InquiryFilterParams {
  status?: InquiryStatus;
  assigned?: string;
  priority?: InquiryPriority;
  search?: string;
  skip?: number;
  limit?: number;
  sort?: 'created_at' | 'updated_at' | 'priority';
  order?: 'asc' | 'desc';
  include_test_data?: boolean;
}

export function buildInquiryListEndpoint(params?: InquiryListQueryParams): string {
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append('status', params.status);
  if (params?.assigned) queryParams.append('assigned', params.assigned);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
  if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.order) queryParams.append('order', params.order);
  if (params?.include_test_data !== undefined) {
    queryParams.append('include_test_data', String(params.include_test_data));
  }

  const queryString = queryParams.toString();
  return queryString
    ? `${API_V1_PREFIX}/admin/inquiries?${queryString}`
    : `${API_V1_PREFIX}/admin/inquiries`;
}
