import { inject } from "inversify";
import { ICategory } from "../../models/category.model";
import { ICategoryService } from "../interface/category.service.interface";
import { ICategoryRepository } from "../../repositories/interface/category.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import logger from "../../shared/services/logger.service";

export class CategoryService implements ICategoryService {
  constructor(
    @inject(TYPES.CategoryRepository)
    private categoryRepository: ICategoryRepository
  ) {}
  async findAllCategory(): Promise<ICategory[] | null> {
    try {
      return await this.categoryRepository.findAllCategory({ parantId: null });
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }
}
