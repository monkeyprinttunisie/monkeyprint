"use client";
import React, { useState, useEffect } from "react";
import UploaderComponent from "@/components/UploaderComponent";
import Image from "next/image";
import { createProduct } from "@/actions/productActions";
import { useCategoryStore } from "@/store/useCategoryStore";

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

  const handleUploadComplete = async (res: any) => {
    if (res && res.length > 0) {
      const uploadedFile = res[0];

      if (uploadedFile && uploadedFile.ufsUrl) {
        setImageUrl(uploadedFile.ufsUrl);
      } else {
        console.error("Uploaded file object or ufsUrl is missing");
      }
    } else {
      console.error("Upload response is empty or malformed");
    }
  };

  const handleUploadError = (error: any) => {
    console.error("Image Upload Error:", error);
  };

  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
        imageUrl,
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
        alert("Product created successfully");
      } else {
        console.error("Failed to save product:", response.error);
        alert(`Failed to create product: ${response.error}`);
      }
    } catch (error) {
      console.error("Error while saving the product:", error);
      alert("Error while saving the product");
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

  return (
    <div className="px-4 pt-6 pb-[8.5vh] w-full  mx-auto">
      <div className="bg-white rounded-xl p-4">
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

            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={() => {
                  // Save current form data in localStorage
                  localStorage.setItem(
                    "pendingProduct",
                    JSON.stringify({
                      name,
                      description,
                      price,
                      stock,
                      targetCategories: selectedTargetCategories,
                      productCategory: selectedProductCategory,
                      subproductCategories: selectedSubproductCategories,
                    })
                  );

                  // Set a flag indicating we're coming from product creation
                  localStorage.setItem("designForProduct", "true");

                  // Navigate to designer tool
                  window.location.href = "/designer_tool/products";
                }}
                className="w-full p-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Design for Product
              </button>

              {imageUrl && (
                <div className="w-full mt-4 rounded-lg overflow-hidden bg-gray-50 flex justify-center">
                  <Image
                    src={imageUrl}
                    alt="Product Image"
                    width={300}
                    height={300}
                    className="h-[200px] w-auto object-contain my-2"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !name || !price || !imageUrl}
              className="w-full py-3 bg-blue-500 text-white rounded-lg text-lg font-medium shadow-md"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddProduct;
