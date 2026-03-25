import { CategoryDto } from "../dtos/category.dtos";
import { ICategory } from "../models/category.model";

export const mapToCategoryDto = (category: ICategory): CategoryDto => {
  const isPopulated = category.parantId && typeof (category.parantId as any).name === 'string';

  return {
    _id: category._id?.toString()!,
    description: category.description,
    name: category.name,
    parantId: isPopulated ? (category.parantId as any)._id?.toString()! : category.parantId?.toString() || null,
    parentName: isPopulated ? (category.parantId as any).name : undefined,
    isBlocked: category.isBlocked ?? false,
    createdAt: category.createdAt?.toString()!,
  };
};
