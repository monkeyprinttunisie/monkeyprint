"use client";
import React, { useState, useEffect } from "react";
import { UploadDropzone } from "@/uploadthing";
import Image from "next/image";
import { createProduct } from "@/actions/productActions";
import { useCategories } from "@/context/categoryContext"; 
import { CategoryType } from "@monkeyprint/db"; 

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

  const { targetCategories, productCategories, subproductCategories } =
    useCategories();

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
    <div className="h-[80vh]">
      <button className="btn" onClick={handleModal}>
        Add New Product
      </button>

      <div className={isOpen ? "modal modal-open" : "modal"}>
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg">Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-control w-full">
              <label className="label font-bold">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered"
                placeholder="Product Name"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label font-bold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input input-bordered"
                placeholder="Product Description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label font-bold">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input input-bordered"
                  placeholder="Price"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label font-bold">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="input input-bordered"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-control w-full mt-4">
              <label className="label font-bold">Target Categories</label>
              <div className="flex flex-wrap gap-2">
                {targetCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`px-3 py-1.5 rounded-md ${
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

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="form-control w-full">
                <label className="label font-bold">Product Category</label>
                <select
                  value={selectedProductCategory}
                  onChange={(e) => setSelectedProductCategory(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Select a category</option>
                  {productCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label font-bold">Subproduct Categories</label>
                <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[44px] overflow-y-auto max-h-32">
                  {selectedProductCategory ? (
                    filteredSubproductCategories.length > 0 ? (
                      filteredSubproductCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className={`px-3 py-1.5 rounded-md ${
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
                      <p className="text-sm text-gray-500">
                        No subcategories available
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-gray-500">
                      Select a product category first
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-control w-[10vw] mt-4">
              <label className="label font-bold">Product Image</label>
              <UploadDropzone className="text-black"
                endpoint="productImage"
                headers={{
                  Authorization: `Bearer ${encodedToken}`,
                }}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
              {imageUrl && (
                <div className="w-full overflow-hidden rounded-lg text-black shadow-md mt-4">
                  <Image
                    src={imageUrl}
                    alt="Product Image"
                    width={1000}
                    height={300}
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="text-black"
                onClick={handleModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-black"
                disabled={isLoading || !name || !price || !imageUrl}
              >
                {isLoading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AddProduct;