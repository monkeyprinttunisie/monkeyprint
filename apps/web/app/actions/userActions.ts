"use server";

import { db, Role } from "@monkeyprint/db";

// Create a new user
export const createUser = async (userData: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role?: Role;
  image?: string;
}) => {
  return await db.user.create({
    data: userData,
  });
};

// Get a user by ID
export const getUserById = async (id: string) => {
  return await db.user.findUnique({
    where: { id },
  });
};

// Get all users
export const getAllUsers = async () => {
  return await db.user.findMany();
};

// Update a user by ID
export const updateUser = async (
  id: string,
  updateData: Partial<{
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: Role;
    image: string;
  }>
) => {
  return await db.user.update({
    where: { id },
    data: updateData,
  });
};

// Soft delete a user by ID
export const deleteUser = async (id: string) => {
  return await db.user.softDelete({ id });
};
