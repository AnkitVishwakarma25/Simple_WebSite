import redisClient from "../config/redis.js";


export const listActiveDevices = async (req, res) => {

    const userId = req.user.id;

    const keys = await redisClient.keys(`refresh_${userId}:*`);

    const devices = [];

    for (const key of keys) {
        const sessionId = key.split(":")[1];

        const sessionData = JSON.parse(await redisClient.get(key));

        devices.push({

            sessionId,
            loginAt: sessionData.loginAt,
            ip: sessionData.ip,
            userAgent: sessionData.userAgent,
        })
    }

    res.json({
        count: devices.length,
        devices,
    })

}