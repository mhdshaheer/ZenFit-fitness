export interface GetCategoryParams {
  filter?: Record<string, any>;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 1 | -1;
}
