"use client";

import { useCategoryStore } from "@/store/useCategoryStore";
import { Category } from "@/types";

interface ProductCategorySectionProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSubCategories: string[];
  onSubCategorySelect: (subCategoryId: string) => void;
}

export default function ProductCategorySection({
  category,
  isExpanded,
  onToggle,
  selectedSubCategories,
  onSubCategorySelect,
}: ProductCategorySectionProps) {

  const getSubproductCategoriesByProduct = useCategoryStore(
    (state) => state.getSubproductCategoriesByProduct
  );

  // Get subproduct categories for this product category
  const subCategories = getSubproductCategoriesByProduct(category.id);

  return (
    <div className="mt-2">
      <button
        className="w-full my-4 text-left font-raleway font-bold text-[17px] text-[#202020] px-4 py-2 bg-white rounded flex justify-between items-center shadow-md shadow-[rgba(0,0,0,0.1)] rounded-[7px]"
        onClick={onToggle}
      >
        {category.name}
        <span className="text-[#004BFE]">
          {isExpanded ? (
            <img src="/icons/up-arrow-icon.svg" alt="up arrow" />
          ) : (
            <img src="/icons/down-arrow-icon.svg" alt="down arrow" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {subCategories.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-2">
              No subcategories found
            </div>
          ) : (
            subCategories.map((subCategory) => (
              <button
                key={subCategory.id}
                className={`px-4 py-2 rounded ${
                  selectedSubCategories.includes(subCategory.id)
                    ? "border-blue-600 border-1 text-blue-600"
                    : "border-2 border-[#FFEBEB] rounded-[7px] text-[#202020] font-bold text-[15px]"
                }`}
                onClick={() => onSubCategorySelect(subCategory.id)}
              >
                {subCategory.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
