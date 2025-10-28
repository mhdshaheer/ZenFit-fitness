import { Router } from "express";
import { TYPES } from "../shared/types/inversify.types";
import { IBookingController } from "../controllers/interface/booking.controller.interface";
import { container } from "../inversify.config";
import authMiddleware from "../middlewares/verifyToken.middleware";

const bookingRouter = Router();
const bookingController = container.get<IBookingController>(
  TYPES.BookingController
);

bookingRouter.use(authMiddleware);
bookingRouter.post("/", (req, res, next) => {
  bookingController.createBooking(req, res).catch(next);
});

export default bookingRouter;
