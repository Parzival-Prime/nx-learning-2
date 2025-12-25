import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prismadb: PrismaClient | undefined;
}

const prisma =
  global.prismadb ??
  new PrismaClient({
    log: ["query", "error"], // optional
  });

if (process.env.NODE_ENV !== "production") {
  global.prismadb = prisma;
}

export default prisma;