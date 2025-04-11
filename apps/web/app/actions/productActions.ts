"use server";

import {
  ProductResponse,
  IProductData,
  Product,
  PaginationProps,
} from "@/types";
import { db } from "@monkeyprint/db";
import { productUpdateSchema } from "@monkeyprint/utils/zod";
import { revalidatePath } from "next/cache";

export async function updateProduct(
  id: string,
  updateData: Partial<IProductData> //make it partial to update only specific fields
) {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const { categoryIds, ...productData } = updateData;
    const validatedData = productUpdateSchema.parse(productData);

    //updating thr product
    const updatedProduct = await db.product.update({
      where: { id },
      data: validatedData,
    });

    // If categoryIds are provided, update product categories
    if (categoryIds && categoryIds.length > 0) {
      // First delete existing product categories
      await db.productCategory.deleteMany({
        where: { productId: id },
      });

      // Then create new product categories
      await Promise.all(
        categoryIds.map((categoryId) =>
          db.productCategory.create({
            data: {
              productId: id,
              categoryId,
            },
          })
        )
      );
    }

    // Revalidate paths to invalidate the cache
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function listProductsAction(): Promise<{
  success?: boolean;
  products?: Product[];
  error?: string;
}> {
  try {
    const products = await db.product.findMany({
      where: { isDeleted: false },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return {
      success: true,
      products,
    }; //to make sure we always return array even if no products found
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch products",
    }; // Return empty array instead of throwing error
  }
}

export async function deleteProductAction(id: string) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  try {
    const product = await db.product.softDelete({ id: id });
    if (!product) {
      throw new Error("Product not found");
    }

    // Revalidate paths to invalidate the cache
    revalidatePath("/products");
    return product;
  } catch (error) {
    throw new Error("Failed to delete product");
  }
}

export async function createProduct(productData: IProductData) {
  try {
    const { categoryIds, ...data } = productData;
    const validatedData = productUpdateSchema.parse(data);

    // Create the product
    const product = await db.product.create({
      data: validatedData,
    });

    // If categoryIds are provided, create product categories
    if (categoryIds && categoryIds.length > 0) {
      await Promise.all(
        categoryIds.map((categoryId) =>
          db.productCategory.create({
            data: {
              productId: product.id,
              categoryId,
            },
          })
        )
      );
    }

    // Revalidate paths to invalidate the cache
    revalidatePath("/products");

    return { success: true, product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

// Filter products by multiple categories (target and subproduct categories at once)
export async function getProductsByCategories(
  categoryIds: string[]
): Promise<ProductResponse> {
  try {
    if (!categoryIds || categoryIds.length === 0) {
      const allProducts = await db.product.findMany({
        where: { isDeleted: false },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return { success: true, products: allProducts };
    }

    // Find which categories are target categories and which are subproduct categories
    const targetCategoryIds: string[] = [];
    const subproductCategoryIds: string[] = [];

    // fetching category info to determine their types
    const categories = await db.category.findMany({
      where: {
        id: { in: categoryIds },
        isDeleted: false,
      },
    });

    // Separate the categories by type
    categories.forEach((category) => {
      if (category.type === "TARGET") {
        targetCategoryIds.push(category.id);
      } else if (category.type === "SUBPRODUCT") {
        subproductCategoryIds.push(category.id);
      }
    });

    // Build the query conditions
    const conditions = [];

    // If there are target categories, add them as AND conditions
    if (targetCategoryIds.length > 0) {
      targetCategoryIds.forEach((id) => {
        conditions.push({
          categories: {
            some: {
              categoryId: id,
            },
          },
        });
      });
    }

    // If there are subproduct categories, add them as ONE OR condition
    if (subproductCategoryIds.length > 0) {
      conditions.push({
        categories: {
          some: {
            categoryId: {
              in: subproductCategoryIds,
            },
          },
        },
      });
    }

    // If no conditions, return all products
    if (conditions.length === 0) {
      return { success: true, products: [] };
    }

    // Query with proper conditions
    const products = await db.product.findMany({
      where: {
        isDeleted: false,
        AND: conditions, // This ensures target categories AND (any of the subcategories)
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return { success: true, products };
  } catch (error) {
    console.error("Error fetching products by categories:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProductsByCategory(
  categoryId: string
): Promise<ProductResponse> {
  return getProductsByCategories([categoryId]);
}

export async function getProductById(id: string): Promise<ProductResponse> {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const product = await db.product.findUnique({
      where: { id, isDeleted: false },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Extract category IDs
    const categoryIds = product.categories.map((pc) => pc.categoryId);

    // Create a modified product with extracted categoryIds
    const productWithCategoryIds = {
      ...product,
      categoryIds, // Add the extracted IDs
    };

    return {
      success: true,
      product: productWithCategoryIds,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function getFirstFourProductsByCategorie(
  categoryId: string
): Promise<ProductResponse> {
  try {
    const result = await getProductsByCategories([categoryId]);
    const products = result.products?.slice(0, 4);
    return {
      success: true,
      products,
    };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while fetching products.",
    };
  }
}

export async function getNewProducts({
  take,
  skip,
}: PaginationProps): Promise<ProductResponse> {
  try {
    const products = await db.product.findMany({
      take: take,
      skip: skip * take,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      products,
    };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while fetching products.",
    };
  }
}
