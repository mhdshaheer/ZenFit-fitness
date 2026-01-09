export interface GetCategoryParams {
  filter?: Record<string, unknown>;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 1 | -1;
}
