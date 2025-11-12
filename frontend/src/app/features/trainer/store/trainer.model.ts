
export interface Program {
  programId: string;
  _id: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  duration: string;
  trainerId: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected' | undefined;
}
export interface ProgramCategory {
  _id: string;
  duration?: number;
  title?: string;
  category?: string;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  id?: string;
}

export interface SlotFormData {
  programId: string;
  duration: number;
  capacity: number;
  timeSlots: TimeSlot[];
}

