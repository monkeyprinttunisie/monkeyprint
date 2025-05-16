"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { deleteCategory } from "@/actions/categoryActions";
import { useCategoryStore } from "@/store/useCategoryStore";

export default function DeleteCategoryPage() {
  const router = useRouter();
  const { id } = useParams();

  const refreshCategories = useCategoryStore(
    (state) => state.refreshCategories
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await deleteCategory(id as string);
      if (result.success) {
        setError(false);
        setMessage("Category deleted successfully! Redirecting..");
        setTimeout(() => {
          refreshCategories();
          router.push(`/superAdmin/categories`);
        }, 2000);
      } else {
        setError(true);
        setMessage(result.error || "Failed to delete category");
      }
    } catch (err) {
      setError(true);
      setMessage("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Delete Category</h1>
      <p className="mb-4">Are you sure you want to delete this category?</p>
      {message && (
        <p className={error ? "text-red-500" : "text-green-500"}>{message}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          {isLoading ? "Deleting..." : "Delete"}
        </button>
        <button
          onClick={() => router.push("/superAdmin/categories")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
