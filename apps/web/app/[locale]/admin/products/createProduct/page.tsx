"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/actions/productActions";
import { useCategoryStore } from "@/store/useCategoryStore";
import { toast } from "react-hot-toast";
import { useUploadThing } from "@/uploadthing";
import ProductImageSelector from "@/components/ProductImageSelector";

const AddProduct: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedTargetCategories, setSelectedTargetCategories] = useState<
    string[]
  >([]);
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<string>("");
  const [selectedSubproductCategories, setSelectedSubproductCategories] =
    useState<string[]>([]);
  const { startUpload } = useUploadThing("productImage");

  const [isImageSelectorOpen, setIsImageSelectorOpen] =
    useState<boolean>(false);

  const router = useRouter();
  const targetCategories = useCategoryStore((state) => state.targetCategories);
  const productCategories = useCategoryStore(
    (state) => state.productCategories
  );
  const subproductCategories = useCategoryStore(
    (state) => state.subproductCategories
  );

  // Get only subproduct categories for the selected product category
  const filteredSubproductCategories = subproductCategories.filter((cat) => {
    return (
      cat.parentCategories?.some(
        (relation) => relation.parentId === selectedProductCategory
      ) ?? false
    );
  });

  const apiKey = process.env.UPLOADTHING_TOKEN;
  const appId = process.env.UPLOADTHING_APP_ID;
  const regions = process.env.UPLOADTHING_REGIONS?.split(",") || ["us", "eu"];
  const tokenData = {
    apiKey,
    appId,
    regions,
  };

  const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString(
    "base64"
  );

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

  useEffect(() => {
    // Check if we have a pending product
    const pendingProduct = localStorage.getItem("pendingProduct");
    if (pendingProduct) {
      try {
        const parsedProduct = JSON.parse(pendingProduct);
        setName(parsedProduct.name || "");
        setDescription(parsedProduct.description || "");
        setPrice(parsedProduct.price || "");
        setStock(parsedProduct.stock || "");
        setSelectedTargetCategories(parsedProduct.targetCategories || []);
        setSelectedProductCategory(parsedProduct.productCategory || "");
        setSelectedSubproductCategories(
          parsedProduct.subproductCategories || []
        );

        // Clear the stored product data
        localStorage.removeItem("pendingProduct");
      } catch (error) {
        console.error("Error parsing pending product:", error);
      }
    }

    // Check if we have a design image
    const designImage = localStorage.getItem("productDesignImage");
    if (designImage) {
      setImageUrl(designImage);
      // Clear the stored design image
      localStorage.removeItem("productDesignImage");
    }
  }, []);

  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const processedImageUrl = await transferImageIfNeeded(imageUrl);
      // Use the processed image URL instead of the original
      if (processedImageUrl !== imageUrl) {
        console.log("Using transferred image URL:", processedImageUrl);
        setImageUrl(processedImageUrl); // Update the state with the new URL
      }

      // Combine all selected categories
      const categoryIds = [
        ...selectedTargetCategories,
        ...selectedSubproductCategories,
      ];

      // Only include the product category if one is selected
      if (selectedProductCategory) {
        categoryIds.push(selectedProductCategory);
      }

      const response = await createProduct({
        name,
        description,
        price: Number(price),
        imageUrl: processedImageUrl,
        stock: Number(stock),
        categoryIds,
      });

      if (response.success) {
        // Reset form
        setName("");
        setPrice("");
        setStock("");
        setDescription("");
        setImageUrl("");
        setSelectedTargetCategories([]);
        setSelectedProductCategory("");
        setSelectedSubproductCategories([]);
        handleModal(); // Close modal
        toast.success("Product created successfully");
      } else {
        toast.error(`Failed to create product: ${response.error}`);
      }
    } catch (error) {
      toast.error("Error while saving the product");
    } finally {
      setIsLoading(false);
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

  // Handler for "Create Design for Product" button
  const handleCreateDesign = () => {
    if (selectedTargetCategories.length === 0) {
      console.log(
        "No target categories selected. Please select at least one target category."
      );
      // No target category selected, show error message
      toast.error(
        "Please select at least one target category before creating a design"
      );
      return;
    }

    // Save the current product data to localStorage
    const productData = {
      name,
      description,
      price,
      stock,
      targetCategories: selectedTargetCategories,
      productCategory: selectedProductCategory,
      subproductCategories: selectedSubproductCategories,
      needsTransfer: true,
    };

    localStorage.setItem("pendingProduct", JSON.stringify(productData));

    // Also save the target categories for mockup selection
    localStorage.setItem(
      "designTargetCategories",
      JSON.stringify(selectedTargetCategories)
    );

    // Also save the target category NAMES for mockup selection
    const targetCategoryNames = selectedTargetCategories
      .map((id) => {
        const category = targetCategories.find((c) => c.id === id);
        return category ? category.name : "";
      })
      .filter((name) => name); // Filter out empty names

    localStorage.setItem(
      "designTargetCategoryNames",
      JSON.stringify(targetCategoryNames)
    );

    // Set flag that we're designing for a product
    localStorage.setItem("designForProduct", "true");

    // Navigate to the designer tool
    router.push("/designer_tool/products");
  };

  const handleImageSelected = (selectedImageUrl: string) => {
    setImageUrl(selectedImageUrl);
    toast.success("Image selected successfully");
  };

  return (
    <div className="px-2 pb-[8.5vh] w-full pt-2">
      <div className="bg-white rounded-xl px-4">
        <h3 className="text-xl font-bold mb-4 text-center">Add New Product</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-base"
              placeholder="Product Name"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-base min-h-[100px]"
              placeholder="Product Description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                placeholder="Price"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
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
            <div className="space-y-3">
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

            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Subproduct Categories
              </label>
              <div className="flex flex-wrap gap-2 border rounded-lg p-3 min-h-[60px] max-h-[120px] overflow-y-auto">
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

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium">Product Image</label>

            {imageUrl ? (
              <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Product"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleCreateDesign}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md mb-3"
                >
                  Create Design for Product
                </button>
                <p className="text-sm text-gray-500 mb-2">or</p>
                <button
                  type="button"
                  onClick={() => setIsImageSelectorOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md mb-3"
                >
                  Select from Existing Images
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !name || !price || !imageUrl}
              className="w-full py-3 bg-blue-500 text-white rounded-lg text-lg font-medium shadow-md"
            >
              {isLoading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
      <ProductImageSelector
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelect={handleImageSelected}
      />
    </div>
  );
};
export default AddProduct;
