FROM node:22-alpine

RUN npm install -g pnpm@11.22.0

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

COPY packages/ ./packages/
COPY apps/metrics/ ./apps/metrics/

RUN pnpm install

WORKDIR /app/apps/metrics

EXPOSE 9090

ENV PORT=9090
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379

CMD ["pnpm", "run", "dev"]
