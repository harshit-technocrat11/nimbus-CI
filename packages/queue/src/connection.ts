import IORedis from "ioredis"

export const redisConnection = new IORedis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest:null
})

redisConnection.on("connect", () => {
    console.log("redis connected")
})

redisConnection.on("error", (err) => {
    console.log("redis connection error", err)
})

export default redisConnection