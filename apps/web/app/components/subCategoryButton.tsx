"use client";

import { Category } from "@/types";

interface SubcategoriesProps {
  subcategories: Category[];
  selectedSubcategories: string[];
  onSubcategoryClick: (subcategoryId: string) => void;
}

export default function SubcategoriesButton({
  subcategories,
  selectedSubcategories,
  onSubcategoryClick,
}: SubcategoriesProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {subcategories.length === 0 ? (
        <div className="col-span-2 text-center text-gray-500 py-2">
          No subcategories found
        </div>
      ) : (
        subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            className={`px-4 py-2 rounded ${
              selectedSubcategories.includes(subcategory.id)
                ? "border-blue-600 border-1 text-blue-600"
                : "border-2 border-[#FFEBEB] rounded-[7px] text-[#202020] font-bold text-[15px]"
            }`}
            onClick={() => onSubcategoryClick(subcategory.id)}
          >
            {subcategory.name}
          </button>
        ))
      )}
    </div>
  );
}
