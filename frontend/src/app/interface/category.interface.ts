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

export interface ISubCategory {
  createdAt: string;
  description: string;
  isBlocked: boolean;
  name: string;
  parantId: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

export interface ITopCategory {
  _id?: string;
  categoryName: string;
  totalPurchases: number;
  totalRevenue: number;
  color?: string;
}
