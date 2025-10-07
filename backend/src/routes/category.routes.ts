import { Router } from "express";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { ICategoryController } from "../controllers/interface/category.controller.interface";
import authMiddleware from "../middlewares/verifyToken.middleware";

const categoryRouter = Router();
const controller = container.get<ICategoryController>(TYPES.CategoryController);

categoryRouter.use(authMiddleware);

categoryRouter.get("/", (req, res, next) => {
  controller.findAllCategory(req, res, next).catch(next);
});
categoryRouter.get("/subcategories", (req, res, next) => {
  controller.findAllSubCategory(req, res, next).catch(next);
});
categoryRouter.post("/", (req, res, next) => {
  controller.createCategory(req, res, next).catch(next);
});
categoryRouter.get("/check-name", (req, res, next) => {
  controller.checkCategoryName(req, res, next).catch(next);
});
categoryRouter.get("/table", (req, res, next) => {
  controller.getTableCategories(req, res, next).catch(next);
});
categoryRouter.put("/:id", (req, res, next) => {
  controller.updateCategory(req, res, next).catch(next);
});
categoryRouter.get("/:id", (req, res, next) => {
  controller.getCategory(req, res, next).catch(next);
});
categoryRouter.put("/status/:id", (req, res, next) => {
  controller.updateStatus(req, res, next).catch(next);
});
export default categoryRouter;
