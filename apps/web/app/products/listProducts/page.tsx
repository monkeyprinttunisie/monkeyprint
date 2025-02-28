"use client"; // This marks the component as a client-side component
import { useEffect, useState } from "react";
import { listProducts } from "@/actions/productActions";
import { BuyProductButton } from "@/components/BuyProductBtn";

export default function ProductHome() {
  const [products, setProducts] = useState<any[]>([]); // State to store products
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission status

  useEffect(() => {
    // Fetch products on mount
    const fetchProducts = async () => {
      const productsList = await listProducts();
      setProducts(productsList);
    };

    fetchProducts();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleProductsUpdated = () => {
    console.log("Products updated!");
  };

  return (
    <div>
      <h1>Products</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price.toString()}</td>
              <td>{product.stock}
                <BuyProductButton
                  isSubmitting={isSubmitting}
                  product={{ ...product, stock: product.stock ?? 0 }}
                  onProductsUpdated={handleProductsUpdated}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
