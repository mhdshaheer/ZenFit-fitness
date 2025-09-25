export interface ICategory {
  _id: string;
  name: string;
  description: string;
  parantId: string | null;
  isBlocked?: boolean;
  createdAt?: Date | string;
  status?: 'active' | 'blocked';
}
