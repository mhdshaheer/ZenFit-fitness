import { env } from "./config/env.config";
import logger from "./shared/services/logger.service";
const port = env.port;
import { mongoDb_connect } from "./config/db.config";
import { createServer } from "http";
import { initializeSocket } from "./shared/sockets/socket";

const startServer = async () => {
  await mongoDb_connect();


  const app = await import("./app");

  const server = createServer(app.default);

  initializeSocket(server);
  server.listen(port, () => {
    logger.info(`Server is running on port ${port}...`);
  });
};

startServer();
