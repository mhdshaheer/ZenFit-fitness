import { CategoryDto } from "../../dtos/category.dtos";
import { GetCategoryParams } from "../../interfaces/category.interface";
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
  checkDuplicateName(name: string): Promise<boolean>;
  updateStatus(categoryId: string, isBlocked: boolean): Promise<CategoryDto>;
  getTableCategories(
    params: GetCategoryParams
  ): Promise<{ data: CategoryDto[]; total: number }>;
}
