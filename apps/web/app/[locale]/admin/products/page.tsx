"use client";

import { useProductStore } from "@/store/useProductStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProductsAdminPage() {
  const products = useProductStore((state) => state.products);
  const loadProducts = useProductStore((state) => state.loadProducts);
  const loading = useProductStore((state) => state.loading);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const router = useRouter();

  const [clickedDeleteId, setClickedDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDeleteClick = (productId: string, productName: string) => {
    setClickedDeleteId(productId);

    toast.promise(
      new Promise((resolve, reject) => {
        toast(
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Confirm Deletion</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this product{" "}
              <strong>"{productName}"</strong>?
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
                onClick={() => resolve(productId)}
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
            id: `delete-product-${productId}`,
            position: "bottom-center",
          }
        );
      })
        .then(async (id) => {
          toast.dismiss(`delete-product-${productId}`);
          await deleteProduct(productId);
          setClickedDeleteId(null);

          return "Product deleted successfully";
        })
        .catch((error) => {
          toast.dismiss(`delete-product-${productId}`);
          setClickedDeleteId(null);

          if (
            error.message === "Cancelled" ||
            error.message === "Dismissed" ||
            error.message === "Auto-closed"
          ) {
            return Promise.reject({
              cancelled: true,
              message: "Delete Cancelled",
            });
          }
          throw error;
        }),
      {
        loading: "Deleting product...",
        success: "Product deleted successfully",
        error: (error) => {
          if (error && error.cancelled) {
            return error.message || "Delete Cancelled";
          }

          return `Error: ${error.message || "Failed to delete product"}`;
        },
      }
    );
  };

  const handleUpdateClick = (productId: string) => {
    router.push(`/admin/products/updateProduct?id=${productId}`);
  };

  return (
    <div className="h-auto mx-auto px-4 pt-2 mb-[8.5vh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Link
          href="/en/admin/products/createProduct"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="w-24 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No products found. Create your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-14 w-14 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-4 py-4 sm:whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price.toFixed(2)}dt
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateClick(product.id)}
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
                            handleDeleteClick(product.id, product.name)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label="Delete product"
                        >
                          <img
                            src={
                              clickedDeleteId === product.id
                                ? "/icons/delete-icon.svg"
                                : "/icons/delete-icon-clicked.svg"
                            }
                            alt="delete"
                            className="w-7 h-7"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
