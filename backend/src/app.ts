import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";

const app = express();
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/user", authRouter);

export default app;
