import { Router } from "express";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { ICategoryController } from "../controllers/interface/category.controller.interface";

const categoryRouter = Router();
const controller = container.get<ICategoryController>(TYPES.CategoryController);

categoryRouter.get("/", controller.findAllCategory.bind(controller));

export default categoryRouter;
