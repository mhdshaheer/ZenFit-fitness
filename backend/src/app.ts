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

const app = express();
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/auth/login", loginLimiter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/file", router);
app.use("/user", userRouter);
app.use("/program", programRouter);
app.use("/session", sessionRouter);

export default app;
