export interface CategoryDto {
  name: string;
  description: string;
  _id: string;
  parantId: string | null;
  parentName?: string;
  isBlocked: boolean;
  createdAt: string;
}
