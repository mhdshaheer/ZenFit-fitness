import { createClient } from "redis";

export const redis = createClient();

redis.on("error", (err) => console.error("Redis Error:", err));

(async () => {
  await redis.connect();
  console.log("Redis connected...");
})();
