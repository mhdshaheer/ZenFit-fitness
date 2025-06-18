import { env } from "./config/env.config";
const port = env.port;
import app from "./app";
import { mongoDb_connect } from "./config/db.config";
const startServer = async () => {
  await mongoDb_connect();
  app.listen(port, () => {
    console.log("Server is running...");
  });
};

startServer();
