/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";

declare global {
  var db: PrismaClient | undefined;
}

export const db =
  global.db ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? [] : ["error"],
  });

export * from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  globalThis.db = db;
}
