import { prisma, type JobLogStream } from "@nimbus-ci/db";
import { logger } from "@nimbus-ci/logger";

interface LogItem {
  jobId: string;
  sequence: number;
  stream: JobLogStream;
  message: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class LogPersister {
  private buffer: LogItem[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL_MS = 500;

  public queue(item: LogItem) {
    // Only queue valid UUIDs that match PostgreSQL @db.Uuid
    if (!UUID_REGEX.test(item.jobId)) {
      return;
    }

    this.buffer.push(item);

    if (this.buffer.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL_MS);
    }
  }

  public async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.buffer.length === 0) return;

    const toInsert = [...this.buffer];
    this.buffer = [];

    try {
      await prisma.jobLog.createMany({
        data: toInsert,
        skipDuplicates: true,
      });
    } catch (error: any) {
      logger.error("[LogPersister] Failed to batch insert logs", {
        error: error?.message || error,
      });
      console.error("[LogPersister Error Details]:", error);
    }
  }
}

export const logPersister = new LogPersister();
