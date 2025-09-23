import { FilterQuery } from "mongoose";
import { CategoryModel, ICategory } from "../../models/category.model";
import { BaseRepository } from "../base.repository";
import { ICategoryRepository } from "../interface/category.repository.interface";

export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository
{
  constructor() {
    super(CategoryModel);
  }
  async findAllCategory(
    conditon: FilterQuery<ICategory>
  ): Promise<ICategory[] | null> {
    return this.model.find(conditon).exec();
  }
}
