const API_V1_PREFIX = '/api/v1';

export interface MessageInboxQueryParams {
  is_read?: boolean;
  message_type?: string;
  message_types?: readonly string[];
  skip?: number;
  limit?: number;
}

export function buildMessageInboxEndpoint(params?: MessageInboxQueryParams): string {
  const queryParams = new URLSearchParams();
  if (params?.is_read !== undefined) {
    queryParams.append('is_read', String(params.is_read));
  }
  if (params?.message_type) {
    queryParams.append('message_type', params.message_type);
  }
  if (params?.message_types) {
    params.message_types.forEach((messageType) => {
      queryParams.append('message_types', messageType);
    });
  }
  if (params?.skip !== undefined) {
    queryParams.append('skip', String(params.skip));
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', String(params.limit));
  }

  const queryString = queryParams.toString();
  return queryString
    ? `${API_V1_PREFIX}/messages/inbox?${queryString}`
    : `${API_V1_PREFIX}/messages/inbox`;
}
