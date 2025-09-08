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
