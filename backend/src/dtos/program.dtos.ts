export type DifficultyLevel = "Beginner" | "Advanced" | "Intermediate";

export interface ProgramDto {
  id: number;
  title: string;
  duration: string;
  category: string;
  description: string;
  image?: string;
  difficultyLevel: string;
  enrolledCount?: number;
  rating?: number;
  price: number;
  status: "active" | "inactive" | "draft";
  approvalStatus?: string;
  trainerId?: string;
  programId?: string;
  createdAt?: string;
}

export interface ProgramSlotDto {
  id: string;
  title: string;
  category: string;
  duration: string;
  entrolledCount?: number;
}

export interface ProgramSlotCreateDto {
  id: string;
  title: string;
  duration: string;
  difficultyLevel: DifficultyLevel;
}
