import winston from "winston";

const { combine, timestamp, errors, json, colorize, printf } =
  winston.format;

const isProduction = process.env.NODE_ENV === "production";

const developmentFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: isProduction
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        developmentFormat
      ),

  transports: [
    new winston.transports.Console(),
  ],
});