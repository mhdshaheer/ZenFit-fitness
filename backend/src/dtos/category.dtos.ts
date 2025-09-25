export interface CategoryDto {
  name: string;
  description: string;
  _id: string;
  parantId: string | null;
  isBlocked: boolean;
  createdAt: string;
}
