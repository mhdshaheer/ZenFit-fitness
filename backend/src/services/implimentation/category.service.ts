import { inject } from "inversify";
import { ICategory } from "../../models/category.model";
import { ICategoryService } from "../interface/category.service.interface";
import { ICategoryRepository } from "../../repositories/interface/category.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import logger from "../../shared/services/logger.service";
import { mapToCategoryDto } from "../../mapper/category.mapper";
import { CategoryDto } from "../../dtos/category.dtos";

export class CategoryService implements ICategoryService {
  constructor(
    @inject(TYPES.CategoryRepository)
    private categoryRepository: ICategoryRepository
  ) {}
  async findAllCategory(): Promise<CategoryDto[]> {
    try {
      const categories = await this.categoryRepository.findAllCategory({
        parantId: null,
      });
      if (categories == null) {
        throw new Error("No categories found.");
      }
      const categoryDto = categories?.map(mapToCategoryDto);

      return categoryDto;
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }
}
