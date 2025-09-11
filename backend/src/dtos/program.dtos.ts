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
}
export interface ProgramSlotDto {
  id: string;
  title: string;
  category: string;
  duration: string;
  entrolledCount?: number;
}
