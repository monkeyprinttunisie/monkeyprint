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

export async function getStoreByUrl(url: string) {
  return await db.store.findFirst({
    where: {
      url: url,
      isDeleted: false,
    },
  });
}

export async function getStoreOwnerByStoreId(storeId: string) {
  const storeOwner = await db.storeUserRelation.findFirst({
    where: {
      storeId: storeId,
      role: "OWNER",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
        },
      },
    },
  });

  return storeOwner?.user;
}
