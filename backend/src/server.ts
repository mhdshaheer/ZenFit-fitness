import { env } from "./config/env.config";
import logger from "./utils/logger";
const port = env.port;
import app from "./app";
import { mongoDb_connect } from "./config/db.config";
const startServer = async () => {
  await mongoDb_connect();
  app.listen(port, () => {
    logger.info("Server is running...");
  });
};

startServer();
