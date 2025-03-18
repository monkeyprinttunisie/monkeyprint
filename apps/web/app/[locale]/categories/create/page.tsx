"use client";

import { useState } from "react";
import { createCategory } from "@/actions/categoryActions";
import { useCategoryStore } from "@/store/useCategoryStore";
import { CategoryType } from "@monkeyprint/db";
import { useRouter } from "next/navigation";

export default function CreateCategoryPage() {
  const router = useRouter();

  const refreshCategories = useCategoryStore(
    (state) => state.refreshCategories
  );
  const targetCategories = useCategoryStore((state) => state.targetCategories);
  const productCategories = useCategoryStore(
    (state) => state.productCategories
  );
  const [categoryData, setCategoryData] = useState({
    name: "",
    type: "TARGET" as CategoryType,
  });

  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  // Get available parent categories based on the selected type
  const getAvailableParents = () => {
    switch (categoryData.type) {
      case "PRODUCT":
        return targetCategories; // Product categories can have target categories as parents
      case "SUBPRODUCT":
        return productCategories; // Subproduct categories can have product categories as parents
      default:
        return []; // Target categories have no parents
    }
  };

  // Toggle parent selection
  const toggleParentSelection = (parentId: string) => {
    setSelectedParentIds((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // For TARGET type, ensure parentIds is empty
      const dataToSubmit = {
        ...categoryData,
        parentIds: categoryData.type === "TARGET" ? [] : selectedParentIds,
      };

      const result = await createCategory(dataToSubmit);

      if (result.success) {
        setMessage("Category created successfully!");
        setMessageType("success");

        // Reset form
        setCategoryData({
          name: "",
          type: "TARGET",
        });
        setSelectedParentIds([]);

        // Refresh categories in context
        await refreshCategories();
      } else {
        setMessage(result.error || "Failed to create category");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An error occurred while creating the category");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Category</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Category Name</label>
          <input
            type="text"
            value={categoryData.name}
            onChange={(e) =>
              setCategoryData({ ...categoryData, name: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Category Type</label>
          <select
            value={categoryData.type}
            onChange={(e) => {
              setCategoryData({
                ...categoryData,
                type: e.target.value as CategoryType,
              });
              // Clear parent selection when changing types
              setSelectedParentIds([]);
            }}
            className="w-full p-2 border rounded"
            required
          >
            <option value="TARGET">Target Category (Top Level)</option>
            <option value="PRODUCT">Product Category (Mid Level)</option>
            <option value="SUBPRODUCT">Subproduct Category (Low Level)</option>
          </select>
        </div>

        {/* Only show parent selection for PRODUCT and SUBPRODUCT types */}
        {categoryData.type !== "TARGET" && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">Parent Categories</label>
            <p className="text-sm text-gray-500 mb-2">
              Select one or more parent categories
            </p>
            <div className="grid grid-cols-2 gap-2 border p-3 rounded max-h-40 overflow-y-auto">
              {getAvailableParents().length === 0 ? (
                <p className="col-span-2 text-center text-gray-500">
                  No available parent categories
                </p>
              ) : (
                getAvailableParents().map((parent) => (
                  <div key={parent.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`parent-${parent.id}`}
                      checked={selectedParentIds.includes(parent.id)}
                      onChange={() => toggleParentSelection(parent.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`parent-${parent.id}`}>{parent.name}</label>
                  </div>
                ))
              )}
            </div>
            {(categoryData.type as CategoryType) !== "TARGET" &&
              selectedParentIds.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  At least one parent category is required
                </p>
              )}
          </div>
        )}

        <div className="flex space-x-4 mt-6">
          <button
            type="button"
            onClick={() => router.push("/categories")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={
              isSubmitting ||
              !categoryData.name ||
              (categoryData.type !== "TARGET" && selectedParentIds.length === 0)
            }
          >
            {isSubmitting ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
