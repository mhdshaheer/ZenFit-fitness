export interface Program {
  programId: string;
  title: string;
  description: string;
  category: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  duration: string;
  trainerId: string;
  status: 'active' | 'inactive' | 'draft';
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
}

export interface SlotFormData {
  programId: string;
  duration: number;
  capacity: number;
  timeSlots: TimeSlot[];
}
