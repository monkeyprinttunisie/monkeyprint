"use client";

import Cart from "@/components/cart";
import { AddToCartButton } from "@/components/addToCartButton";
import DeleteProductButton from "@/components/DeleteProductButton";
import { useProducts } from "@/context/ProductContext";

export default function ProductHome() {
  const {products, deleteProduct} = useProducts();

  return (
    <div>
      <h1>Products</h1>
      <Cart />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price.toString()}</td>
              <td>
                <AddToCartButton product={product} />
                <DeleteProductButton
                  productId={product.id}
                  onDelete={deleteProduct}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
