FROM docker.io/oven/bun:latest
USER root
RUN apt-get update && apt-get install -y podman
RUN chmod 666 /run/podman/podman.sock || true
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
RUN bunx prisma generate
RUN mkdir -p temp