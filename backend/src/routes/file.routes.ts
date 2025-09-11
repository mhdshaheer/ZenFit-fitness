import { Router } from "express";
import multer from "multer";
import { container } from "../inversify.config";
import { TYPES } from "../types/inversify.types";
import { IFileController } from "../controllers/interface/s3.controller.interface";
import authMiddleware from "../middlewares/verifyToken.middleware";

const router = Router();
const upload = multer();

const fileController = container.get<IFileController>(TYPES.FileController);

router.post(
  "/profile/upload",
  upload.single("file"),
  authMiddleware,
  (req, res) => fileController.upload(req, res)
);
router.get("/profile/image", authMiddleware, (req, res) =>
  fileController.getFile(req, res)
);
router.delete("/profile/:key", authMiddleware, (req, res) =>
  fileController.deleteFile(req, res)
);

export default router;
