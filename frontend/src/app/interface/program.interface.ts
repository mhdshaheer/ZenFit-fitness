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

export interface ITopPrograms {
  _id?: string;
  courseName: string;
  totalPurchases: number;
  totalRevenue: number;
}

export interface IProgramsSlotCreate {
  id: string;
  title: string;
  duration: string;
  difficultyLevel: string;
}
