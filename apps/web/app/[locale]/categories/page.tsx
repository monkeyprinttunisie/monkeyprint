"use client";

import { useState } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import Link from "next/link";
import { Category } from "@/types";
import { useRouter } from "next/navigation";

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

  const handleDeleteCategory = async (id: string) => {
    try {
      router.push(`/categories/delete_category/${id}`);
      /* const result = await deleteCategory(id);

if (result.success) {
setDeleteMessage("Category deleted successfully");
setMessageType("success");
refreshCategories();
} else {
setDeleteMessage(result.error || "Failed to delete category");
setMessageType("error");
} */
    } catch (error) {
      setDeleteMessage("An error occurred while deleting the category");
      setMessageType("error");
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setDeleteMessage(null);
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mb-[2vh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Link href="/categories/create" className="btn btn-primary">
          Add New Category
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
                        <td className="py-2 px-4 border-b text-center">
                          <div className="flex justify-center space-x-2">
                            <Link
                              href={`/categories/edit/${category.id}`}
                              className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              Delete
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
