import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin.routes";
import passport from "passport";
import "./config/passport";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import router from "./routes/file.routes";
import userRouter from "./routes/user.routes";

const app = express();
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/file", router);
app.use("/user", userRouter);

export default app;
