import { Router } from "express";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { ICategoryController } from "../controllers/interface/category.controller.interface";

const categoryRouter = Router();
const controller = container.get<ICategoryController>(TYPES.CategoryController);

categoryRouter.get("/", (req, res, next) => {
  controller.findAllCategory(req, res).catch(next);
});
categoryRouter.get("/subcategories", (req, res, next) => {
  controller.findAllSubCategory(req, res).catch(next);
});
export default categoryRouter;
