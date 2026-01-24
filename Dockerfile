FROM docker.io/oven/bun:latest
RUN apt-get update && apt-get install -y podman

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bunx prisma generate