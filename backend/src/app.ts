import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/passport";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import rateLimit from "express-rate-limit";

// Routers
import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin.routes";
import router from "./routes/file.routes";
import userRouter from "./routes/user.routes";
import programRouter from "./routes/program.routes";
import sessionRouter from "./routes/session.routes";
import categoryRouter from "./routes/category.routes";
import { errorMiddleware } from "./middlewares/errorHandle.middleware";
import paymentRouter from "./routes/payment.routes";
import { container } from "./inversify.config";
import { TYPES } from "./shared/types/inversify.types";
import { IPaymentController } from "./controllers/interface/payment.controller.interface";
import { env } from "./config/env.config";
import { API_ROUTES } from "./const/apiRoutes.const";
import { HttpResponse } from "./const/response_message.const";

const app = express();
app.use(
  cors({
    origin: env.frontend_url,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(passport.initialize());

const paymentController = container.get<IPaymentController>(
  TYPES.PaymentController
);

app.use(
  `${API_ROUTES.PAYMENT}/webhook`,
  express.raw({ type: "application/json" }),
  (req, res) => paymentController.webhook(req, res)
);
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: HttpResponse.TOO_MANY_LOGIN_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use(API_ROUTES.AUTH.LOGIN, loginLimiter);
app.use(API_ROUTES.AUTH.BASE, authRouter);
app.use(API_ROUTES.ADMIN, adminRouter);
app.use(API_ROUTES.FILE, router);
app.use(API_ROUTES.USER, userRouter);
app.use(API_ROUTES.PROGRAM, programRouter);
app.use(API_ROUTES.SESSION, sessionRouter);
app.use(API_ROUTES.CATEGORY, categoryRouter);
app.use(API_ROUTES.PAYMENT, paymentRouter);

// Global Error handling
app.use(errorMiddleware);

export default app;
