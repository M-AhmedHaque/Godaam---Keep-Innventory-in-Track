import { stockEventEmitter, STOCK_UPDATED } from "./stockEvents.js";
import redisClient from "../config/redis.js";

stockEventEmitter.on(STOCK_UPDATED, async ({ cacheKeys = [] }) => {
  try {
    for (const key of cacheKeys) {
      await redisClient.del(key);
      console.log(`[Cache] Invalidated key: ${key}`);
    }
  } catch (err) {
    console.error("Error invalidating cache:", err);
  }
});
