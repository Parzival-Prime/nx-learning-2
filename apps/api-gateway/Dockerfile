# ---------- BUILD ----------
FROM parzivalprime/my-node-deps:latest AS builder

WORKDIR /repo

# Copy source code
COPY apps/api-gateway ./apps/api-gateway
COPY packages ./packages
COPY prisma ./prisma

# Copy dependency files (already installed in my-node-deps)
COPY package.json package-lock.json ./

# Build app
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

RUN npx prisma generate
RUN npx nx build api-gateway

# ---------- RUN ----------
FROM parzivalprime/my-node-base:latest

WORKDIR /app

# Copy runtime dependencies
COPY --from=builder /repo/node_modules ./node_modules

# Copy built files
COPY --from=builder /repo/dist/apps/api-gateway ./ 
COPY --from=builder /repo/generated ./generated

RUN mkdir -p node_modules/.prisma/client \
    && cp -r generated/prisma/* node_modules/.prisma/client/

# Set environment variables if needed
ENV NODE_ENV=production

CMD ["node", "main.js"]
