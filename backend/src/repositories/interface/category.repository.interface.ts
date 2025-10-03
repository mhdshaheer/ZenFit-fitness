import { FilterQuery } from "mongoose";
import { ICategory } from "../../models/category.model";
import { GetCategoryParams } from "../../interfaces/category.interface";

export interface ICategoryRepository {
  findAllCategory(
    condition: FilterQuery<ICategory>
  ): Promise<ICategory[] | null>;

  createCategory(category: Partial<ICategory>): Promise<ICategory>;
  updateCategory(
    categoryId: string,
    category: Partial<ICategory>
  ): Promise<ICategory | null>;

  getCategory(categoryId: string): Promise<ICategory | null>;
  findByCategoryName(name: string): Promise<ICategory | null>;
  updateStatus(
    categoryId: string,
    isBlocked: boolean
  ): Promise<ICategory | null>;
  getAllForTable(
    options: GetCategoryParams
  ): Promise<{ total: number; data: ICategory[] }>;
}
