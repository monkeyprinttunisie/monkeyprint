"use server";

import { db, StoreType } from "@monkeyprint/db";

export async function createStoreUserRelation(data: {
  storeId: string;
  userId: string;
  role?: StoreType;
}) {
  return await db.storeUserRelation.create({
    data,
  });
}

export async function getStoreUserRelationByStore(
  storeId: string,
  role?: StoreType
) {
  return await db.storeUserRelation.findMany({
    where: { storeId: storeId, role: role },
  });
}

export async function getStoreUserRelationById(id: {
  storeId: string;
  userId: string;
}) {
  return await db.storeUserRelation.findUnique({
    where: { storeId_userId: { storeId: id.storeId, userId: id.userId } },
  });
}

export async function getStoreUserRelationByRole(role: StoreType) {
  return await db.storeUserRelation.findMany({
    where: { role: role },
  });
}

export async function getAllStoreUserRelations() {
  return await db.storeUserRelation.findMany();
}

export async function updateStoreUserRelation(
  id: { storeId: string; userId: string },
  data: { role?: StoreType }
) {
  return await db.storeUserRelation.update({
    where: { storeId_userId: { storeId: id.storeId, userId: id.userId } },
    data,
  });
}

export async function deleteStoreUserRelation(id: {
  storeId: string;
  userId: string;
}) {
  return await db.storeUserRelation.delete({
    where: { storeId_userId: { storeId: id.storeId, userId: id.userId } },
  });
}
