import { FilterQuery } from "mongoose";
import { CategoryModel, ICategory } from "../../models/category.model";
import { BaseRepository } from "../base.repository";
import { ICategoryRepository } from "../interface/category.repository.interface";
import { GetCategoryParams } from "../../interfaces/category.interface";
import { injectable } from "inversify";

@injectable()
export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository {
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
  async updateStatus(
    categoryId: string,
    isBlocked: boolean
  ): Promise<ICategory | null> {
    return this.model.findByIdAndUpdate(
      categoryId,
      { $set: { isBlocked } },
      { new: true }
    );
  }
  async getAllForTable(
    options: GetCategoryParams
  ): Promise<{ total: number; data: ICategory[] }> {
    const {
      filter = {},
      sortBy = "createdAt",
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
      search = "",
    } = options;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const total = await this.model.countDocuments(filter);

    // Fetch users with filter, sort, pagination
    const categories = await this.model
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return { total, data: categories };
  }
}
