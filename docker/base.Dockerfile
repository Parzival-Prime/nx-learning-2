FROM node:20-bullseye

# System tools (minimal)
RUN apk add --no-cache bash libc6-compat

WORKDIR /repo
