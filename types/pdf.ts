export interface PlanDeliverable {
  id: string;
  file_name: string;
  file_url: string;
  deliverable_type: string;
  uploaded_at: string;
  uploaded_by: {
    id: string;
    name: string;
  };
  recipient: {
    id: string;
    last_name: string;
    first_name: string;
  };
  plan_cycle: {
    cycle_count: number;
  };
}

export interface PdfListResponse {
  items: PlanDeliverable[];
  total: number;
  skip: number;
  limit: number;
}

export interface PdfListParams {
  office_id?: string;
  skip?: number;
  limit?: number;
  search?: string;
  recipient_id?: string;
  deliverable_type?: string;
}

export interface RecipientOption {
  id: string;
  last_name: string;
  first_name: string;
}
