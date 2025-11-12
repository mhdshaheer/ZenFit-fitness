import { Router } from "express";
import { MeetingController } from "../controllers/implimentation/meeting.controller";
import { MeetingService } from "../services/implimentation/meeting.service";
import { MeetingRepository } from "../repositories/implimentation/meeting.repository";
import { BookingRepository } from "../repositories/implimentation/booking.repository";
import { SlotRepository } from "../repositories/implimentation/slot.repository";
import { MeetingModel } from "../models/meeting.model";
import { BookingModel } from "../models/booking.model";
import { SlotModel } from "../models/slot.model";
import authMiddleware from "../middlewares/verifyToken.middleware";

const meetingRouter = Router();

// Initialize repositories
const meetingRepository = new MeetingRepository(MeetingModel);
const bookingRepository = new BookingRepository(BookingModel);
const slotRepository = new SlotRepository(SlotModel);

// Initialize service
const meetingService = new MeetingService(
  meetingRepository,
  bookingRepository,
  slotRepository
);

// Initialize controller
const meetingController = new MeetingController(meetingService);

// Apply auth middleware to all routes
meetingRouter.use(authMiddleware);

// Routes
meetingRouter.post("/create", (req, res, next) => {
  meetingController.createMeeting(req, res).catch(next);
});

meetingRouter.post("/validate", (req, res, next) => {
  meetingController.validateMeetingAccess(req, res).catch(next);
});

meetingRouter.post("/join", (req, res, next) => {
  meetingController.joinMeeting(req, res).catch(next);
});

meetingRouter.post("/:meetingId/end", (req, res, next) => {
  meetingController.endMeeting(req, res).catch(next);
});

meetingRouter.post("/:meetingId/leave", (req, res, next) => {
  meetingController.leaveMeeting(req, res).catch(next);
});

export default meetingRouter;
