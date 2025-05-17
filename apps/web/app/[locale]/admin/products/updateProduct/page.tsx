"use client";

import { updateProduct, getProductById } from "@/actions/productActions";
import { useState, useEffect, useRef } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { getCategoryById } from "@/actions/categoryActions";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUploadThing } from "@/uploadthing";
import ProductImageSelector from "@/components/ProductImageSelector";

export default function UpdateProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("id");
  const [hasLoaded, setHasLoaded] = useState(false);

  const [product, setProduct] = useState({
    id: productIdFromUrl || "",
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
  const [isImageSelectorOpen, setIsImageSelectorOpen] =
    useState<boolean>(false);

  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { startUpload } = useUploadThing("productImage");

  // Flag to prevent circular updates
  const isInitialCategoryLoad = useRef(false);

  // Transfer image if needed - same as in createProduct page
  const transferImageIfNeeded = async (url: string): Promise<string> => {
    // Check if this is a DynamicMockups URL
    if (
      url.includes(
        "app-dynamicmockups-psd-engine-production.s3.eu-central-1.amazonaws.com"
      )
    ) {
      try {
        console.log("Transferring DynamicMockups image to UploadThing...");

        // Fetch the image
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Convert to blob
        const imageBlob = await response.blob();

        // Create a File object from the blob
        const file = new File(
          [imageBlob],
          `transferred-mockup-${Date.now()}.png`,
          { type: "image/png" }
        );

        // Upload to UploadThing using the same hook used in previewProduct
        const uploadResult = await startUpload([file]);

        if (!uploadResult || uploadResult.length === 0) {
          throw new Error("Failed to upload image to UploadThing");
        }

        // Get the new URL
        const newUrl = uploadResult[0].ufsUrl;
        console.log("Image transferred successfully:", newUrl);

        return newUrl;
      } catch (error) {
        console.error("Error transferring image:", error);
        // If transfer fails, return the original URL
        return url;
      }
    }

    // If not a DynamicMockups URL, return as is
    return url;
  };

  // Check for data from designer tool - once on component mount
  useEffect(() => {
    // First check: Is this a return from the designer tool?
    const pendingProduct = localStorage.getItem("pendingProduct");
    const designImage = localStorage.getItem("productDesignImage");

    console.log("Checking for saved data on mount");
    if (pendingProduct) console.log("Found pending product data");
    if (designImage) console.log("Found design image");

    let shouldSkipApiLoad = false;

    // Process pending product data if it exists
    if (pendingProduct) {
      try {
        const parsedProduct = JSON.parse(pendingProduct);
        console.log("Parsed product data:", parsedProduct);

        // Make sure this data is for our current product
        if (parsedProduct.id === productIdFromUrl) {
          console.log("Restoring product data from localStorage");

          // Update product object with saved values
          setProduct((prev) => ({
            ...prev,
            name: parsedProduct.name || prev.name,
            description: parsedProduct.description || prev.description,
            price: parsedProduct.price
              ? Number(parsedProduct.price)
              : prev.price,
            stock: parsedProduct.stock
              ? Number(parsedProduct.stock)
              : prev.stock,
            // Don't update imageUrl here - we'll handle it separately below
          }));

          // Restore categories
          if (parsedProduct.targetCategories) {
            setSelectedTargetCategories(parsedProduct.targetCategories);
          }
          if (parsedProduct.productCategory) {
            setSelectedProductCategory(parsedProduct.productCategory);
          }
          if (parsedProduct.subproductCategories) {
            setSelectedSubproductCategories(parsedProduct.subproductCategories);
          }

          shouldSkipApiLoad = true;
          setHasLoaded(true);
        }
      } catch (error) {
        console.error("Error parsing pending product data:", error);
      }
    }

    // Apply design image if available
    if (designImage) {
      console.log("Applying design image:", designImage);
      setProduct((prev) => ({
        ...prev,
        imageUrl: designImage,
      }));
    }

    // Clear localStorage items to prevent reuse
    localStorage.removeItem("pendingProduct");
    localStorage.removeItem("productDesignImage");
    localStorage.removeItem("designForProductUpdate");
    localStorage.removeItem("designForProduct");

    // If we loaded data from localStorage, don't load from API
    if (productIdFromUrl && !shouldSkipApiLoad) {
      loadProductFromAPI(productIdFromUrl);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Function to load product from API - separated for clarity
  const loadProductFromAPI = async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Loading product data from API:", id);
      const result = await getProductById(id);

      if (result.success && result.product) {
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
          categoryIds: categoryIds,
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
  };

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

  // getting subproduct categories for the selected product category
  const filteredSubproductCategories = subproductCategories.filter((cat) => {
    return (
      cat.parentCategories?.some(
        (relation) => relation.parentId === selectedProductCategory
      ) ?? false
    );
  });

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

  // New function to handle creating a design - simplified like in createProduct
  const handleCreateDesign = () => {
    if (selectedTargetCategories.length === 0) {
      toast.error(
        "Please select at least one target category before creating a design"
      );
      return;
    }

    // Save the current product data to localStorage - same structure as createProduct
    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      targetCategories: selectedTargetCategories,
      productCategory: selectedProductCategory,
      subproductCategories: selectedSubproductCategories,
      categoryIds: product.categoryIds,
      needsTransfer: true,
      isUpdate: true,
    };

    console.log("Saving product data before going to designer:", productData);
    localStorage.setItem("pendingProduct", JSON.stringify(productData));

    // Save the target categories for mockup selection
    localStorage.setItem(
      "designTargetCategories",
      JSON.stringify(selectedTargetCategories)
    );

    // Save the target category NAMES for mockup selection
    const targetCategoryNames = selectedTargetCategories
      .map((id) => {
        const category = targetCategories.find((c) => c.id === id);
        return category ? category.name : "";
      })
      .filter((name) => name);

    localStorage.setItem(
      "designTargetCategoryNames",
      JSON.stringify(targetCategoryNames)
    );

    // Set flags that we're designing for a product
    localStorage.setItem("designForProduct", "true");
    localStorage.setItem("designForProductUpdate", "true");

    // Navigate to the designer tool
    router.push("/designer_tool/products");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setIsSubmitting(true);
    setMessage(null);

    try {
      // First transfer the image if needed (from DynamicMockups to UploadThing)
      const processedImageUrl = await transferImageIfNeeded(product.imageUrl);
      let updatedImageUrl = product.imageUrl;

      // If the URL has changed after transfer, update it
      if (processedImageUrl !== product.imageUrl) {
        console.log("Using transferred image URL:", processedImageUrl);
        updatedImageUrl = processedImageUrl;
        setProduct((prev) => ({ ...prev, imageUrl: processedImageUrl }));
      }

      const updatedProduct = await updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: updatedImageUrl,
        stock: product.stock,
        categoryIds: product.categoryIds,
      });

      if (updatedProduct.success) {
        setMessage("Product updated successfully! redirecting...");
        setTimeout(() => {
          router.push("/superAdmin/products");
        }, 1000);
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

  const handleImageSelected = (selectedImageUrl: string) => {
    product.imageUrl = selectedImageUrl;
    toast.success("Image selected successfully");
  };

  return (
    <div className="px-4 pt-4 pb-[8.5vh] w-full max-w-lg mx-auto">
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => router.push("/admin/products")}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to products"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Update Product</h1>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Product ID</label>
            <input
              type="text"
              value={product.id}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-100"
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
            <div className="flex flex-col items-center mt-4">
              <button
                type="button"
                onClick={handleCreateDesign}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Create New Design
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Design a new image using our designer tool
              </p>
            </div>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setIsImageSelectorOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md mb-3"
              >
                Select from Existing Images
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium">
              Target Categories
            </label>
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
      )}
      <div>
        <ProductImageSelector
          isOpen={isImageSelectorOpen}
          onClose={() => setIsImageSelectorOpen(false)}
          onSelect={handleImageSelected}
        />
      </div>
    </div>
  );
}
