"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import ProductCategorySection from "@/components/productCategorySection";
import { Category } from "@/types";

interface CategoriesFilterProps {
  selectedCategory: string;
  selectedSubCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  onSubCategorySelect: (subCategoryIds: string[]) => void;
}

export default function CategoriesFilter({
  selectedCategory,
  selectedSubCategories,
  onCategorySelect,
  onSubCategorySelect,
}: CategoriesFilterProps) {

  const targetCategories = useCategoryStore((state) => state.targetCategories);
  const loading = useCategoryStore((state) => state.loading);
  const getProductCategoriesByTarget = useCategoryStore(
    (state) => state.getProductCategoriesByTarget
  );
  const getSubproductCategoriesByProduct = useCategoryStore(
    (state) => state.getSubproductCategoriesByProduct
  );

  // Get filtered product categories based on selected target
  const availableProductCategories =
    getProductCategoriesByTarget(selectedCategory);

  // Get filtered subproduct categories based on selected product categories
  const availableSubCategories =
    selectedCategory !== "all"
      ? getSubproductCategoriesByProduct(selectedCategory)
      : [];
      
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [filteredProductCategories, setFilteredProductCategories] = useState<
    Category[]
  >([]);

  // Update filtered product categories when target category changes
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProductCategories(getProductCategoriesByTarget("all"));
    } else {
      setFilteredProductCategories(
        getProductCategoriesByTarget(selectedCategory)
      );
    }
  }, [selectedCategory, getProductCategoriesByTarget]);

  // Toggle expanded state for a product category
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle subcategory selection
  const handleSubCategorySelect = (subCategoryId: string) => {
    const updatedSelection = selectedSubCategories.includes(subCategoryId)
      ? selectedSubCategories.filter((id) => id !== subCategoryId)
      : [...selectedSubCategories, subCategoryId];

    onSubCategorySelect(updatedSelection);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-raleway font-bold text-[28px] text-[#202020]">
          All Products
        </h2>
        <Link href="/">
          <button className="text-gray-500 hover:text-gray-700">
            <img src="/icons/close-icon.svg" alt="close icon" />
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Target Categories (Male, Female, All) */}
          <div className="flex justify-between gap-2 my-2">
            <button
              className={`px-4 py-2 w-[100%] rounded-[9px] font-raleway font-medium text-[17px] text-center 
                        ${selectedCategory === "all" ? "bg-blue-100 border-blue-600 border-1 text-blue-600" : "bg-gray-100 text-black"}`}
              onClick={() => onCategorySelect("all")}
            >
              All
            </button>

            {targetCategories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 w-[100%] rounded-[9px] font-raleway font-medium text-[17px] text-center 
                          ${selectedCategory === category.id ? "bg-blue-100 border-blue-600 border-1 text-blue-600" : "bg-gray-100 text-black"}`}
                onClick={() => onCategorySelect(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Product Categories with their subproduct categories */}
          <div className="mt-4">
            {filteredProductCategories.map((category) => (
              <ProductCategorySection
                key={category.id}
                category={category}
                isExpanded={!!expandedCategories[category.id]}
                onToggle={() => toggleCategory(category.id)}
                selectedSubCategories={selectedSubCategories}
                onSubCategorySelect={handleSubCategorySelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
