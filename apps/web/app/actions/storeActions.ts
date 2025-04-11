"use server";

import { db } from "@monkeyprint/db";

export async function getAllStores() {
  return await db.store.findMany();
}

export async function getStoreById(id: string) {
  return await db.store.findUnique({
    where: { id: id },
  });
}
