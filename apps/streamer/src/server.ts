import "dotenv/config";
import http from "http";
import { logger } from "@nimbus-ci/logger";
import { startConsumer } from "@nimbus-ci/kafka";
import { setupWebSocket, broadcastLog } from "./websocket.js";
import { logPersister } from "./persister.js";

const PORT = process.env.PORT || 8001;

// create HTTP Server
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "nimbus-streamer" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// attach WebSocket Server
setupWebSocket(server);

//  start Kafka Consumer
const initKafkaConsumer = async () => {
  try {
    await startConsumer(
      {
        groupId: "nimbus-streamer-group",
        fromBeginning: false, // Read live logs
      },
      ({ key, value }) => {
        if (!key || !value) return;

        //  Broadcast live to active WebSocket viewers
        broadcastLog(key, value);

        // Queue for batched DB persistence
        try {
          const parsed = JSON.parse(value);
          logPersister.queue({
            jobId: parsed.jobId,
            sequence: parsed.sequence,
            stream: parsed.stream || "STDOUT",
            message: parsed.message,
          });
        } catch (err) {
         
          logPersister.queue({
            jobId: key,
            sequence: 0,
            stream: "STDOUT",
            message: value,
          });
        }
      }
    );
    logger.info(" Kafka Streamer Consumer started successfully");
  } catch (error) {
    logger.error("❌ Failed to start Kafka Streamer Consumer", { error });
  }
};


// Start Server
server.listen(PORT, async () => {
  logger.info(` Nimbus Streamer running on http://localhost:${PORT} and ws://localhost:${PORT}/ws`);
  await initKafkaConsumer();
});
