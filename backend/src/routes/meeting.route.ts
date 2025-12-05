import { Router } from "express";
import { MeetingController } from "../controllers/implimentation/meeting.controller";
import { MeetingService } from "../services/implimentation/meeting.service";
import { MeetingRepository } from "../repositories/implimentation/meeting.repository";
import { BookingRepository } from "../repositories/implimentation/booking.repository";
import { SlotInstanceRepository } from "../repositories/implimentation/slotInstance.repository";
import { MeetingModel } from "../models/meeting.model";
import { BookingModel } from "../models/booking.model";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { INotificationService } from "../services/interface/notification.service.interface";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const meetingRouter = Router();

// Initialize repositories
const meetingRepository = new MeetingRepository(MeetingModel);
const bookingRepository = new BookingRepository();
const slotInstanceRepository = new SlotInstanceRepository();
const notificationService = container.get<INotificationService>(TYPES.NotificationService);

// Initialize service
const meetingService = new MeetingService(
  meetingRepository,
  bookingRepository,
  slotInstanceRepository,
  notificationService
);

// Initialize controller
const meetingController = new MeetingController(meetingService);

// Apply auth middleware to all routes
meetingRouter.use(authMiddleware);

// Routes
meetingRouter.post(
  "/create",
  adaptHandler(meetingController.createMeeting.bind(meetingController))
);

meetingRouter.post(
  "/validate",
  adaptHandler(meetingController.validateMeetingAccess.bind(meetingController))
);

meetingRouter.post(
  "/join",
  adaptHandler(meetingController.joinMeeting.bind(meetingController))
);

meetingRouter.post(
  "/:meetingId/end",
  adaptHandler(meetingController.endMeeting.bind(meetingController))
);

meetingRouter.post(
  "/:meetingId/leave",
  adaptHandler(meetingController.leaveMeeting.bind(meetingController))
);

export default meetingRouter;
