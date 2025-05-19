"use client";

import { AddToCartButton } from "@/components/addToCartButton";
import { useProductStore } from "@/store/useProductStore";
import CategoriesFilter from "@/components/categoriesFilter";
import { getStoreByUrl } from "@/actions/storeActions";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductHome() {
  const params = useParams();
  const storeUrl = params.storeUrl as string;
  const locale = params.locale as string;

  // Product state from store
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const loadStoreProducts = useProductStore((state) => state.loadStoreProducts);

  // Local state
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    []
  );
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch data only once on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchStoreAndProducts() {
      try {
        // Get store information by URL
        const store = await getStoreByUrl(storeUrl);

        if (!store || !isMounted) return;

        setStoreId(store.id);

        // Load all products for this store
        await loadStoreProducts(store.id);
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    fetchStoreAndProducts();

    return () => {
      isMounted = false;
    };
  }, [storeUrl, loadStoreProducts]);

  // Filter products on the client side for immediate responses
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // If "all" is selected and no subcategories, return all products
    if (selectedCategory === "all" && selectedSubCategories.length === 0) {
      return products;
    }

    return products.filter((product) => {
      const productCategories =
        product.categories?.map((pc) => pc.categoryId) || [];

      // Check if product has the selected main category
      const hasMainCategory =
        selectedCategory === "all" ||
        productCategories.includes(selectedCategory);

      // Check if product has any of the selected subcategories
      const hasSubCategory =
        selectedSubCategories.length === 0 ||
        productCategories.some((catId) =>
          selectedSubCategories.includes(catId)
        );

      return hasMainCategory && hasSubCategory;
    });
  }, [products, selectedCategory, selectedSubCategories]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategories([]);
  };

  const handleSubCategorySelect = (subCategoryIds: string[]) => {
    setSelectedSubCategories(subCategoryIds);
  };

  // Combined loading state
  const isLoading = initialLoading || loading;

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
      {isLoading ? (
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
                <Link
                  href={`/${locale}/store/${storeUrl}/allProducts/${product.id}`}
                  className="cursor-pointer"
                >
                  <div className="p-1.5 bg-white shadow-md shadow-[rgba(0,0,0,0.1)] rounded-[9px]">
                    <img
                      className="w-[100%] h-[26vh] rounded-[9px]"
                      src={product.imageUrl}
                      alt={product.name}
                      width={200}
                      height={200}
                      loading="lazy"
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
