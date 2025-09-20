import { ICategory } from "../../models/category.model";

export interface ICategoryService {
  findAllCategory(): Promise<ICategory[] | null>;
}
