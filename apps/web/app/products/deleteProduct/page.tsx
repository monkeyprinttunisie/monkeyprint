"use client";

import { useEffect, useState } from "react";

type Product = {
    id: string;
    name: string;
    price: number;
  };

export default function DeleteProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Fetch products
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const res = await fetch("/api/products");
  //       if (!res.ok) throw new Error("Failed to fetch products");
  //       const data = await res.json();
  //       setProducts(data);
  //     } catch (err) {
  //       setError((err as Error).message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProducts();
  // }, []);
  // Soft delete product
  // const handleDelete = async (id: string) => {
  //   if (!confirm("Are you sure you want to delete this product?")) return;

  //   try {
  //     const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  //     if (!res.ok) throw new Error("Failed to delete product");

  //     setProducts((prev) => prev.filter((product) => product.id !== id));
  //     alert("Product soft deleted successfully");
  //   } catch (err) {
  //     alert((err as Error).message);
  //   }
  // };
  const productId = "01"; // Example product ID to delete

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");

      alert("Product soft deleted successfully");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    // <main className="p-8">
    //   <h1 className="text-2xl font-bold mb-4">Delete Products</h1>

    //   {products.length === 0 ? (
    //     <p>No products found.</p>
    //   ) : (
    //     <ul className="space-y-4">
    //       {products.map((product) => (
    //         <li
    //           key={product.id}
    //           className="flex justify-between items-center p-4 border rounded-lg shadow-sm"
    //         >
    //           <div>
    //             <p className="font-semibold">{product.name}</p>
    //             <p className="text-sm text-gray-600">${product.price}</p>
    //           </div>
    //           <button
    //             onClick={() => handleDelete(product.id)}
    //             className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    //           >
    //             Soft Delete
    //           </button>
    //         </li>
    //       ))}
    //     </ul>
    //   )}
    // </main>
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Delete Product</h1>
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Soft Delete Product
      </button>
    </main>
  );
}