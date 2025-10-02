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
  async createCategory(category: Partial<ICategory>): Promise<ICategory> {
    return this.create(category);
  }
  async updateCategory(
    categoryId: string,
    category: Partial<ICategory>
  ): Promise<ICategory | null> {
    return this.update(categoryId, category);
  }
  async getCategory(categoryId: string): Promise<ICategory | null> {
    return this.findOne({ _id: categoryId });
  }
  async findByCategoryName(name: string): Promise<ICategory | null> {
    return this.findByName(name);
  }
}
