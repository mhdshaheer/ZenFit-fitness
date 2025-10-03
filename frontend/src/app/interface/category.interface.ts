export interface ICategory {
  _id: string;
  name: string;
  description: string;
  parantId: string | null;
  isBlocked?: boolean;
  createdAt?: Date | string;
  status?: 'active' | 'blocked';
}
export interface IParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
