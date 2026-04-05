import redis from "../utils/redis.js";

export const cache = (ttl = 60) => {
  return async (req, res, next) => {
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        console.log(`Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache miss: ${cacheKey}`);

      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await redis.setex(cacheKey, ttl, JSON.stringify(data));
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache error:", error);
      next();
    }
  };
};

export const clearCache = async (pattern) => {
  const keys = await redis.keys(`cache:${pattern}`);
  if (keys.length > 0) {
    await redis.del(keys);
    console.log(`Cache cleared: ${keys.length} keys`);
  }
};
