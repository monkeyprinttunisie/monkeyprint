"use server";

import { PaginationProps } from "@/types";
import { db } from "@monkeyprint/db";

export async function getAllStores() {
  return await db.store.findAll();
}
