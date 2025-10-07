#TODO Rewrite

FROM oven/bun:1.1.13 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

# copy whole app over
COPY . .

RUN bun run build