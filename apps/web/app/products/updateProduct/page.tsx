"use client";

import { updateProduct } from "@/actions/productActions";
import { useState } from "react";
import { UpdateProductButton } from "@/components/updateProductButton";

export default function UpdateProductPage() {
  const [product, setProduct] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    active: true,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const updatedProduct = await updateProduct(product.id, product)
      if (updatedProduct.success) {
        setMessage("Product updated successfully!");
      } else {
        setMessage(updatedProduct.error || "Failed to update product");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Update Product</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product ID</label>
          <input
            type="text"
            value={product.id}
            onChange={(e) => setProduct({ ...product, id: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="number"
            value={product.price.toString()}
            onChange={(e) =>
              setProduct({ ...product, price: parseFloat(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <label>Active</label>
          <input
            type="checkbox"
            checked={product.active}
            onChange={(e) =>
              setProduct({ ...product, active: e.target.checked })
            }
          />
        </div>
        <div>
            
          <UpdateProductButton
            isSubmitting={isSubmitting}
            onClick={handleSubmit}
          /> 

        </div>
        {message && <div>{message}</div>}
      </form>
    </div>
  );
}
