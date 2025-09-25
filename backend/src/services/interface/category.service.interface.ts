import { CategoryDto } from "../../dtos/category.dtos";
import { ICategory } from "../../models/category.model";

export interface ICategoryService {
  findAllCategory(): Promise<CategoryDto[]>;
  findALlSubCategory(): Promise<CategoryDto[]>;
  createCategory(data: Partial<ICategory>): Promise<CategoryDto>;
  updateCategory(
    categoryId: string,
    category: Partial<ICategory>
  ): Promise<CategoryDto>;
  getCategory(categoryId: string): Promise<CategoryDto>;
}
