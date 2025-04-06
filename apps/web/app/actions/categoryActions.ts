"use server";

import { db } from "@monkeyprint/db";
import { revalidatePath } from "next/cache";
import { CategoryType } from "@monkeyprint/db";
import { CategoryResponse, ICategoryData } from "@/types";

export async function createCategory(
  categoryData: ICategoryData
): Promise<CategoryResponse> {
  try {
    const newCategory = await db.category.create({
      data: {
        name: categoryData.name,
        type: categoryData.type,
      },
    });

    if (categoryData.parentIds?.length) {
      await Promise.all(
        categoryData.parentIds.map((parentId) =>
          db.categoryRelation.create({
            data: { parentId, childId: newCategory.id },
          })
        )
      );
    }

    const categoryWithRelations = await db.category.findUnique({
      where: { id: newCategory.id },
      include: {
        childCategories: { include: { child: true } },
        parentCategories: { include: { parent: true } },
      },
    });

    revalidatePath("/categories");
    revalidatePath("/products");

    return { success: true, category: categoryWithRelations || newCategory };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  updateData: Partial<ICategoryData>
): Promise<CategoryResponse> {
  try {
    if (!id) throw new Error("Category ID is required");

    const updatedCategory = await db.category.update({
      where: { id },
      data: { name: updateData.name, type: updateData.type },
    });

    if (updateData.parentIds) {
      await db.categoryRelation.deleteMany({ where: { childId: id } });
      await Promise.all(
        updateData.parentIds.map((parentId) =>
          db.categoryRelation.create({ data: { parentId, childId: id } })
        )
      );
    }

    const categoryWithRelations = await db.category.findUnique({
      where: { id },
      include: {
        childCategories: { include: { child: true } },
        parentCategories: { include: { parent: true } },
      },
    });

    revalidatePath("/categories");
    revalidatePath("/products");

    return {
      success: true,
      category: categoryWithRelations || updatedCategory,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<CategoryResponse> {
  try {
    if (!id) throw new Error("Category ID is required");

    const category = await db.category.findUnique({
      where: { id },
      include: { childCategories: true },
    });

    if (category?.childCategories?.length) {
      return {
        success: false,
        error:
          "Cannot delete category with subcategories. Delete subcategories first.",
      };
    }

    await db.categoryRelation.deleteMany({
      where: { OR: [{ parentId: id }, { childId: id }] },
    });
    const deletedCategory = await db.category.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath("/categories");
    revalidatePath("/products");

    return { success: true, category: deletedCategory };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function listCategories(): Promise<CategoryResponse> {
  try {
    const categories = await db.category.findMany({
      where: { isDeleted: false },
      include: {
        childCategories: {
          include: {
            child: true,
          },
          where: {
            child: {
              isDeleted: false,
            },
          },
        },
        parentCategories: {
          include: {
            parent: true,
          },
          where: {
            parent: {
              isDeleted: false,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getCategoryById(id: string): Promise<CategoryResponse> {
  try {
    if (!id) throw new Error("Category ID is required");

    const category = await db.category.findUnique({
      where: { id },
      include: {
        childCategories: {
          include: {
            child: true,
          },
          where: {
            child: {
              isDeleted: false,
            },
          },
        },
        parentCategories: {
          include: {
            parent: true,
          },
          where: {
            parent: {
              isDeleted: false,
            },
          },
        },
      },
    });

    if (!category) return { success: false, error: "Category not found" };

    return { success: true, category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function getCategoriesByType(
  type: CategoryType
): Promise<CategoryResponse> {
  try {
    const categories = await db.category.findMany({
      where: { type, isDeleted: false },
      include: {
        childCategories: {
          include: {
            child: true,
          },
          where: {
            child: {
              isDeleted: false,
            },
          },
        },
        parentCategories: {
          include: {
            parent: true,
          },
          where: {
            parent: {
              isDeleted: false,
            },
          },
        },
      },
    });

    return { success: true, categories };
  } catch (error) {
    console.error(`Error fetching ${type} categories:`, error);
    return { success: false, error: `Failed to fetch ${type} categories` };
  }
}

export async function getCategoriesByTypeWithPagination(type: CategoryType) {
  const firstFourCategories = await db.category.findMany({
    where: { type },
    take: 4,
  });

  return firstFourCategories;
}

export async function getCategoryProductCount(categoryId: string) {
  return await db.productCategory.count({
    where: {
      categoryId: categoryId,
    },
  });
}
