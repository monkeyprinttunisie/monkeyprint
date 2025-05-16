"use client";

import { AddToCartButton } from "@/components/addToCartButton";
import { useProductStore } from "@/store/useProductStore";
import CategoriesFilter from "@/components/categoriesFilter";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function ProductHome() {
  const filteredProducts = useProductStore((state) => state.filteredProducts);
  const loading = useProductStore((state) => state.loading);
  const filterByCategories = useProductStore(
    (state) => state.filterByCategories
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    []
  );
  // preventing unnecessary re-renders
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // filtering products whenever selections change
  useEffect(() => {
    // Skiping the effect during the initial render
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    const handleFilterProducts = async () => {
      // creating categories array to filter by
      let categoriesToFilter = [];

      // adding target category if not "all"
      if (selectedCategory !== "all") {
        categoriesToFilter.push(selectedCategory);
      }

      // adding subcategories if any are selected
      if (selectedSubCategories.length > 0) {
        categoriesToFilter.push(...selectedSubCategories);
      }

      // applying filters
      await filterByCategories(categoriesToFilter);
    };

    handleFilterProducts();
  }, [selectedCategory, selectedSubCategories, filterByCategories]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Clear subcategory selection when changing main category
    setSelectedSubCategories([]);
  };

  const handleSubCategorySelect = (subCategoryIds: string[]) => {
    setSelectedSubCategories(subCategoryIds);
  };

  return (
    <div className="bg-white pb-[8.5vh] overflow-x-hidden">
      <CategoriesFilter
        selectedCategory={selectedCategory}
        selectedSubCategories={selectedSubCategories}
        onCategorySelect={handleCategorySelect}
        onSubCategorySelect={handleSubCategorySelect}
      />
      <h1 className="ml-2 mt-4 font-raleway font-bold text-[21px] text-gray-800">
        Products
      </h1>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 m-3 mt-0">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No products found for this category
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="p-2 flex flex-col">
                <Link href={`/store/allProducts/${product.id}`} className="cursor-pointer">
                  <div className="p-1.5 bg-white shadow-md shadow-[rgba(0,0,0,0.1)] rounded-[9px]">
                    <img
                      className="w-[100%] h-[26vh] rounded-[9px]"
                      src={product.imageUrl}
                      alt={product.name}
                      width={200}
                      height={200}
                    />
                  </div>
                </Link>
                <div className="text-left">
                  <h2 className="mt-3 font-nunito font-normal text-[16px] leading-[16px] text-gray-800">
                    {product.name}
                  </h2>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-raleway font-bold text-[4.5vw] text-gray-800">
                    {product.price.toFixed(2)}dt
                  </p>
                  <AddToCartButton product={product} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
