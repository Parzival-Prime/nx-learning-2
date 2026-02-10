
# ---------- BUILD ----------
FROM my-node-deps AS builder

WORKDIR /repo

COPY apps/api-gateway ./apps/api-gateway
COPY packages ./packages
COPY prisma ./prisma

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

RUN npx prisma generate
RUN npx nx build api-gateway

# ---------- RUN ----------
FROM my-node-base

WORKDIR /app

COPY --from=builder /repo/dist/apps/api-gateway ./
COPY --from=builder /repo/generated ./generated

CMD ["node", "main.js"]