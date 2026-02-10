
# ---------- BUILD ----------
FROM my-node-deps AS builder

WORKDIR /repo

COPY apps/auth-service ./apps/auth-service
COPY packages ./packages
COPY prisma ./prisma

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

RUN npx prisma generate
RUN npx nx build auth-service

# ---------- RUN ----------
FROM my-node-base

WORKDIR /app

COPY --from=builder /repo/dist/apps/auth-service ./
COPY --from=builder /repo/generated ./generated

CMD ["node", "main.js"]