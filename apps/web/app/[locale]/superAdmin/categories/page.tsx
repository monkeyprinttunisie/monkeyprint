"use client";

import { useState } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import Link from "next/link";
import { Category } from "@/types";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/actions/categoryActions";
import { toast } from "sonner";

export default function CategoriesPage() {
  const router = useRouter();

  const targetCategories = useCategoryStore((state) => state.targetCategories);
  const productCategories = useCategoryStore(
    (state) => state.productCategories
  );
  const subproductCategories = useCategoryStore(
    (state) => state.subproductCategories
  );
  const loading = useCategoryStore((state) => state.loading);
  const refreshCategories = useCategoryStore(
    (state) => state.refreshCategories
  );

  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  // Group all categories by type for display
  const categoryGroups = [
    {
      title: "Target Categories",
      categories: targetCategories,
      type: "TARGET",
    },
    {
      title: "Product Categories",
      categories: productCategories,
      type: "PRODUCT",
    },
    {
      title: "Subproduct Categories",
      categories: subproductCategories,
      type: "SUBPRODUCT",
    },
  ];

  // Get parent category names from the category
  const getCategoryParentNames = (category: Category) => {
    if (!category.parentCategories || category.parentCategories.length === 0) {
      return "None";
    }

    const parentNames: string[] = [];

    category.parentCategories.forEach((relation) => {
      if (relation.parent) {
        parentNames.push(relation.parent.name);
      } else {
        // If parent object not included in the relation, look up by ID
        const parent = [
          ...targetCategories,
          ...productCategories,
          ...subproductCategories,
        ].find((c) => c.id === relation.parentId);

        if (parent) {
          parentNames.push(parent.name);
        }
      }
    });

    return parentNames.length > 0 ? parentNames.join(", ") : "Unknown";
  };

  const handleDeleteCategory = (id: string, name: string) => {
    toast.promise(
      new Promise((resolve, reject) => {
        toast(
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Confirm Deletion</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the category{" "}
              <strong>"{name}"</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => reject(new Error("Cancelled"))}
                className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => resolve(id)}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>,
          {
            duration: 100000,
            onDismiss: () => reject(new Error("Dismissed")),
            onAutoClose: () => reject(new Error("Auto-closed")),
            id: `delete-confirmation-${id}`,
            position: "bottom-center",
          }
        );
      })
        .then(async (categoryId) => {
          toast.dismiss(`delete-confirmation-${id}`);
          const result = await deleteCategory(id);
          if (!result.success) {
            throw new Error(result.error || "Failed to delete category");
          }

          await refreshCategories();
          return "Category deleted successfully";
        })
        .catch((error) => {
          toast.dismiss(`delete-confirmation-${id}`);

          // If cancelled, indicate it's a cancellation
          if (
            error.message === "Cancelled" ||
            error.message === "Dismissed" ||
            error.message === "Auto-closed"
          ) {
            return Promise.reject({ cancelled: true }); // Special object to identify cancellation
          }

          // For actual errors, rethrow them
          throw error;
        }),
      {
        loading: "Deleting category...",
        success: "Category deleted successfully",
        error: (error) => {
          // Check for our special cancellation object
          if (error && error.cancelled) {
            return `${error.message || "Delete Cancelled"}`;
          }

          return `Error: ${error.message || "Failed to delete category"}`;
        },
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mb-[2vh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Link
          href="/superAdmin/categories/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add
        </Link>
      </div>

      {deleteMessage && (
        <div
          className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {deleteMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        categoryGroups.map((group, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{group.title}</h2>

            {group.categories.length === 0 ? (
              <p className="text-gray-500">
                No {group.title.toLowerCase()} found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                      <th className="py-2 px-4 border-b text-left">
                        Parent Categories
                      </th>
                      <th className="py-2 px-4 border-b text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{category.name}</td>
                        <td className="py-2 px-4 border-b">
                          {getCategoryParentNames(category)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/superAdmin/categories/edit/${category.id}`
                                )
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                              aria-label="Edit product"
                            >
                              <img
                                src="/icons/edit-button.svg"
                                alt="edit"
                                className="w-6 h-6"
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCategory(category.id, category.name)
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                              aria-label="Delete product"
                            >
                              <img
                                src="/icons/delete-icon-clicked.svg"
                                alt="delete"
                                className="w-7 h-7"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
