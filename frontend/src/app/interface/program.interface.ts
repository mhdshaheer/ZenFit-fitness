export interface IProgramTable {
  _id: string;
  name: string;
  description: string;
  price: number;
  isBlocked?: boolean;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | undefined;
  createdAt?: Date | string;
  status?: 'active' | 'blocked';
}
