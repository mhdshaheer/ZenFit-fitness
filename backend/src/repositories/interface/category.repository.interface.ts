import { FilterQuery } from "mongoose";
import { ICategory } from "../../models/category.model";

export interface ICategoryRepository {
  findAllCategory(
    condition: FilterQuery<ICategory>
  ): Promise<ICategory[] | null>;
}
