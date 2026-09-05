import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "@nimbus-ci/logger";

const rooms = new Map<string, Set<WebSocket>>();

// connection endpoint
export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    // 1. Extract jobId from query params: ws://localhost:8001/ws?jobId=xxx

    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) {
      logger.warn("[WebSocket] Connection rejected: Missing jobId");
      ws.close(1008, "jobId is required");
      return;
    }

    if (!rooms.has(jobId)) {
      rooms.set(jobId, new Set());
    }

    rooms.get(jobId)!.add(ws);
    logger.info(`[WebSocket] Client joined room for job: ${jobId} (Total: ${rooms.get(jobId)?.size})`);
    // 3. Clean up on disconnect
    ws.on("close", () => {
      rooms.get(jobId)?.delete(ws);
      if (rooms.get(jobId)?.size === 0) {
        rooms.delete(jobId);
      }
      logger.info(`[WebSocket] Client left room for job: ${jobId}`);
    });
    ws.on("error", (err) => {
      logger.error(`[WebSocket] Error for job ${jobId}`, { err });
    });
  });
  return wss;
};


// broadcast client

export const broadcastLog =  (jobId: string, payload: string) => {

    const subscribers = rooms.get(jobId);
    if (!subscribers || subscribers.size === 0) return ;

    for (const client of subscribers){
        if (client.readyState === WebSocket.OPEN){
            client.send(payload);
        }
    }


}