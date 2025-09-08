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
