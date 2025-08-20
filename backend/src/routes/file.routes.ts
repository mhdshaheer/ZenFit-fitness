import { Router } from "express";
import multer from "multer";
import { container } from "../inversify.config";
import { TYPES } from "../types/inversify.types";
import { IFileController } from "../controllers/interface/s3.controller.interface";

const router = Router();
const upload = multer();

const fileController = container.get<IFileController>(TYPES.FileController);

router.post("/profile/upload", upload.single("file"), (req, res) =>
  fileController.upload(req, res)
);
router.get("/user/profile/:key", (req, res) =>
  fileController.getFile(req, res)
);
router.delete("/profile/:key", (req, res) =>
  fileController.deleteFile(req, res)
);

export default router;
