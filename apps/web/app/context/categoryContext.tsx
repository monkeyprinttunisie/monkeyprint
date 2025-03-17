"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Category } from "@/types";
import { listCategories } from "@/actions/categoryActions";

interface CategoryContextType {
  targetCategories: Category[];
  productCategories: Category[];
  subproductCategories: Category[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
  // Add new filtering methods
  getProductCategoriesByTarget: (targetId: string) => Category[];
  getSubproductCategoriesByProduct: (productId: string) => Category[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [targetCategories, setTargetCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [subproductCategories, setSubproductCategories] = useState<Category[]>(
    []
  );
  const [categoryRelations, setCategoryRelations] = useState<{
    [key: string]: {
      parents: string[];
      children: string[];
    };
  }>({});
  const [loading, setLoading] = useState<boolean>(true);

  const refreshCategories = async () => {
    setLoading(true);

    try {
      // Call the server action directly
      const result = await listCategories();

      if (result.success && result.categories) {
        // Filter by type
        setTargetCategories(
          result.categories.filter((cat) => cat.type === "TARGET")
        );
        setProductCategories(
          result.categories.filter((cat) => cat.type === "PRODUCT")
        );
        setSubproductCategories(
          result.categories.filter((cat) => cat.type === "SUBPRODUCT")
        );

        // Build the category relations lookup map
        const relations: {
          [key: string]: {
            parents: string[];
            children: string[];
          };
        } = {};

        // Initialize all categories
        result.categories.forEach((cat) => {
          relations[cat.id] = {
            parents: [],
            children: [],
          };
        });

        // Populate the relations
        result.categories.forEach((cat) => {
          // Add parent-child relations
          if (cat.parentCategories?.length) {
            cat.parentCategories.forEach((relation) => {
              // Add this category's parent
              relations[cat.id].parents.push(relation.parentId);

              // Add this category as child to parent
              if (relations[relation.parentId]) {
                relations[relation.parentId].children.push(cat.id);
              }
            });
          }

          // Add child-parent relations
          if (cat.childCategories?.length) {
            cat.childCategories.forEach((relation) => {
              // Add this category's child
              relations[cat.id].children.push(relation.childId);

              // Add this category as parent to child
              if (relations[relation.childId]) {
                relations[relation.childId].parents.push(cat.id);
              }
            });
          }
        });

        setCategoryRelations(relations);
      } else {
        console.error("Error loading categories:", result.error);
        // Set empty arrays in case of error
        setTargetCategories([]);
        setProductCategories([]);
        setSubproductCategories([]);
        setCategoryRelations({});
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Set empty arrays in case of error
      setTargetCategories([]);
      setProductCategories([]);
      setSubproductCategories([]);
      setCategoryRelations({});
    } finally {
      setLoading(false);
    }
  };

  // Get product categories that are children of a specific target category
  const getProductCategoriesByTarget = (targetId: string): Category[] => {
    if (targetId === "all") {
      return productCategories;
    }

    const childrenIds = categoryRelations[targetId]?.children || [];
    return productCategories.filter(
      (cat) =>
        childrenIds.includes(cat.id) ||
        // Also include products with no parent if "all" is selected
        (targetId === "all" && !categoryRelations[cat.id]?.parents.length)
    );
  };

  // Get subproduct categories that are children of a specific product category
  const getSubproductCategoriesByProduct = (productId: string): Category[] => {
    const childrenIds = categoryRelations[productId]?.children || [];
    return subproductCategories.filter((cat) => childrenIds.includes(cat.id));
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        targetCategories,
        productCategories,
        subproductCategories,
        loading,
        refreshCategories,
        getProductCategoriesByTarget,
        getSubproductCategoriesByProduct,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
