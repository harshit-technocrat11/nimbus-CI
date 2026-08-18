import morgan from "morgan";
import { logger } from "./logger.js";

export const httpLogger = morgan(
  ":method :url :status :response-time ms",
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }
);