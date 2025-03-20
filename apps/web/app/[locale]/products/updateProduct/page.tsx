"use client";

import { updateProduct, getProductById } from "@/actions/productActions";
import { useState, useEffect, useRef } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { getCategoryById } from "@/actions/categoryActions";

export default function UpdateProductPage() {
  const [product, setProduct] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    stock: 0,
    categoryIds: [] as string[],
  });

  const [selectedTargetCategories, setSelectedTargetCategories] = useState<
    string[]
  >([]);
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<string>("");
  const [selectedSubproductCategories, setSelectedSubproductCategories] =
    useState<string[]>([]);

  const targetCategories = useCategoryStore((state) => state.targetCategories);
  const productCategories = useCategoryStore(
    (state) => state.productCategories
  );
  const subproductCategories = useCategoryStore(
    (state) => state.subproductCategories
  );

  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Flag to prevent circular updates
  const isInitialCategoryLoad = useRef(false);

  // getting subproduct categories for the selected product category
  const filteredSubproductCategories = subproductCategories.filter((cat) => {
    return (
      cat.parentCategories?.some(
        (relation) => relation.parentId === selectedProductCategory
      ) ?? false
    );
  });

  // Loading product data when ID changes
  useEffect(() => {
    async function fetchProduct() {
      if (!product.id) return;

      setIsLoading(true);
      try {
        // Here you should add getProductById to your productActions.ts
        const result = await getProductById(product.id);

        if (result.success && result.product) {
          // The product object from the modified getProductById will have categoryIds
          // TypeScript doesn't know this, so we need to use type assertion or extract ids manually

          // Extract category IDs from product.categories if categoryIds doesn't exist
          const categoryIds =
            result.product.categoryIds ||
            result.product.categories?.map((cat) => cat.categoryId) ||
            [];

          setProduct({
            id: result.product.id,
            name: result.product.name,
            description: result.product.description || "",
            price: result.product.price,
            imageUrl: result.product.imageUrl || "",
            stock: result.product.stock || 0,
            categoryIds: categoryIds, // Use the extracted IDs
          });

          // Mark that we're loading categories to prevent the other effect from running
          isInitialCategoryLoad.current = true;

          // Load categories
          await loadCategories(categoryIds);
        } else {
          setMessage("Product not found");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setMessage("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    }

    if (product.id) {
      fetchProduct();
    }
  }, [product.id]); // Only depend on ID, not categoryIds

  // Function to load categories by their IDs
  const loadCategories = async (categoryIds: string[]) => {
    const targetCats: string[] = [];
    let productCat = "";
    const subproductCats: string[] = [];

    for (const categoryId of categoryIds) {
      const result = await getCategoryById(categoryId);
      if (result.success && result.category) {
        const category = result.category;

        switch (category.type) {
          case "TARGET":
            targetCats.push(category.id);
            break;
          case "PRODUCT":
            productCat = category.id;
            break;
          case "SUBPRODUCT":
            subproductCats.push(category.id);
            break;
        }
      }
    }

    setSelectedTargetCategories(targetCats);
    setSelectedProductCategory(productCat);
    setSelectedSubproductCategories(subproductCats);

    // Reset the flag after categories are loaded
    setTimeout(() => {
      isInitialCategoryLoad.current = false;
    }, 0);
  };

  // Update product.categoryIds when selections change
  useEffect(() => {
    // Skip this effect during initial category loading
    if (isInitialCategoryLoad.current) return;

    const allCategoryIds = [
      ...selectedTargetCategories,
      ...(selectedProductCategory ? [selectedProductCategory] : []),
      ...selectedSubproductCategories,
    ];

    setProduct((prev) => ({
      ...prev,
      categoryIds: allCategoryIds,
    }));
  }, [
    selectedTargetCategories,
    selectedProductCategory,
    selectedSubproductCategories,
  ]);

  const handleProductIdChange = (id: string) => {
    // Only update the ID - the useEffect will load the full product data
    setProduct((prev) => ({ ...prev, id }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") {
      // add condition to prevent TypeError: e.preventDefault is not a function error
      e.preventDefault();
    }
    setIsSubmitting(true);
    setMessage(null);

    try {
      const updatedProduct = await updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        categoryIds: product.categoryIds,
      });

      if (updatedProduct.success) {
        setMessage("Product updated successfully!");
      } else {
        setMessage(updatedProduct.error || "Failed to update product");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle selection for target categories
  const toggleTargetCategory = (categoryId: string) => {
    setSelectedTargetCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle selection for subproduct categories
  const toggleSubproductCategory = (categoryId: string) => {
    setSelectedSubproductCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="px-4 pt-4 pb-[8.5vh] w-full max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Update Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Product ID</label>
          <input
            type="text"
            value={product.id}
            onChange={(e) => handleProductIdChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg text-base min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              step="0.01"
              value={product.price.toString()}
              onChange={(e) =>
                setProduct({ ...product, price: parseFloat(e.target.value) })
              }
              className="w-full p-3 border border-gray-300 rounded-lg text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Stock</label>
            <input
              type="number"
              value={product.stock.toString()}
              onChange={(e) =>
                setProduct({ ...product, stock: parseInt(e.target.value) })
              }
              className="w-full p-3 border border-gray-300 rounded-lg text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Image URL</label>
          <input
            type="text"
            value={product.imageUrl}
            onChange={(e) =>
              setProduct({ ...product, imageUrl: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
            required
          />
          {product.imageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 flex justify-center">
              <img
                src={product.imageUrl}
                alt="Product preview"
                className="h-[180px] object-contain"
              />
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium">Target Categories</label>
          <div className="flex flex-wrap gap-2">
            {targetCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`px-3 py-2 rounded-lg text-sm ${
                  selectedTargetCategories.includes(category.id)
                    ? "bg-blue-100 border-blue-600 border text-blue-600"
                    : "bg-gray-100"
                }`}
                onClick={() => toggleTargetCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Product Category
            </label>
            <select
              value={selectedProductCategory}
              onChange={(e) => setSelectedProductCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
            >
              <option value="">Select a category</option>
              {productCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Subproduct Categories
            </label>
            <div className="flex flex-wrap gap-2 border border-gray-300 rounded-lg p-3 min-h-[60px] max-h-[120px] overflow-y-auto">
              {selectedProductCategory ? (
                filteredSubproductCategories.length > 0 ? (
                  filteredSubproductCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`px-3 py-2 rounded-lg text-sm ${
                        selectedSubproductCategories.includes(category.id)
                          ? "bg-blue-100 border-blue-600 border text-blue-600"
                          : "bg-gray-100"
                      }`}
                      onClick={() => toggleSubproductCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 w-full text-center py-2">
                    No subcategories available
                  </p>
                )
              ) : (
                <p className="text-sm text-gray-500 w-full text-center py-2">
                  Select a product category first
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white rounded-lg text-base font-medium shadow-md disabled:bg-blue-300"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
