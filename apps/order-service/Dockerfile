
# ---------- BUILD ----------
FROM parzivalprime/my-node-deps:latest AS builder

WORKDIR /repo

COPY apps/order-service ./apps/auth-service
COPY packages ./packages
COPY prisma ./prisma

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

RUN npx prisma generate
RUN npx nx build order-service

# ---------- RUN ----------
FROM parzivalprime/my-node-base:latest

WORKDIR /app

COPY --from=builder /repo/dist/apps/order-service ./
COPY --from=builder /repo/generated ./generated

CMD ["node", "main.js"]