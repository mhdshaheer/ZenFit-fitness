import { inject } from "inversify";
import { ICategoryService } from "../interface/category.service.interface";
import { ICategoryRepository } from "../../repositories/interface/category.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import logger from "../../shared/services/logger.service";
import { mapToCategoryDto } from "../../mapper/category.mapper";
import { CategoryDto } from "../../dtos/category.dtos";
import { ICategory } from "../../models/category.model";

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
  async findALlSubCategory(): Promise<CategoryDto[]> {
    try {
      const subCategories = await this.categoryRepository.findAllCategory({
        parantId: { $ne: null },
      });
      if (subCategories == null) {
        throw new Error("No sub categories found.");
      }
      const subCategoryDto = subCategories?.map(mapToCategoryDto);

      return subCategoryDto;
    } catch (error) {
      logger.error("Error fetching sub categories:", error);
      throw new Error("Failed to fetch sub categories");
    }
  }

  async createCategory(data: Partial<ICategory>): Promise<CategoryDto> {
    const category = await this.categoryRepository.createCategory(data);
    if (!category) {
      throw new Error("error in category creation.");
    }
    const mappedResult = mapToCategoryDto(category);
    return mappedResult;
  }

  async updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<CategoryDto> {
    const category = await this.categoryRepository.updateCategory(
      categoryId,
      categoryData
    );
    if (!category) {
      throw new Error("Category updation failed");
    }
    const mappedCategory = mapToCategoryDto(category);
    return mappedCategory;
  }

  async getCategory(categoryId: string): Promise<CategoryDto> {
    const category = await this.categoryRepository.getCategory(categoryId);
    if (!category) {
      throw new Error("Failed to get category");
    }
    const mappedCategory = mapToCategoryDto(category);
    return mappedCategory;
  }
}
