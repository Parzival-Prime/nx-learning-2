
# ---------- BUILD ----------
FROM parzivalprime/my-node-deps:latest AS builder

WORKDIR /repo

COPY apps/product-service ./apps/product-service
COPY packages ./packages
COPY prisma ./prisma

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

RUN npx prisma generate
RUN npx nx build product-service

# ---------- RUN ----------
FROM parzivalprime/my-node-base:latest

WORKDIR /app

COPY --from=builder /repo/dist/apps/product-service ./
COPY --from=builder /repo/generated ./generated

CMD ["node", "main.js"]