FROM node:20-alpine

# System tools (minimal)
RUN apk add --no-cache bash libc6-compat

WORKDIR /repo
