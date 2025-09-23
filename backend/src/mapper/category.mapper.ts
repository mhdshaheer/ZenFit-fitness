import { CategoryDto } from "../dtos/category.dtos";
import { ICategory } from "../models/category.model";

export const mapToCategoryDto = (category: ICategory): CategoryDto => {
  return {
    _id: category._id?.toString()!,
    description: category.descrition,
    name: category.name,
    parantId: category.parantId?.toString()!,
  };
};
