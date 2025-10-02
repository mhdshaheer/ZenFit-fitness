import { FilterQuery } from "mongoose";
import { ICategory } from "../../models/category.model";

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
}
