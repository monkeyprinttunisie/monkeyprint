"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/button";
import { updateProduct } from "@/actions/productActions";
export default function Cart() {
  const { cart, updateCartItemQuantity, removeFromCart, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleBuy = async () => {
    try {
      for (const item of cart) {
        await updateProduct(item.id, {
          name: item.name,
          price: item.price,
          stock: item.stock - item.quantity,
          imageUrl: item.imageUrl,
        });
      }
      await clearCart();
      alert("Purchase successful!");
    } catch (error) {
      alert("Failed to complete purchase.");
    }
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div>
      <Button onClick={() => setIsOpen(!isOpen)} className="">
        Cart({cart.reduce((total, item) => total + item.quantity, 0)})
      </Button>
      {isOpen && (
        <div className="cart-modal">
          <h2>Cart</h2>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <p>{item.name}</p>
              <p>Price: ${item.price}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Total: ${item.price * item.quantity}</p>
              <button
                onClick={() =>
                  updateCartItemQuantity(item.id, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <button
                onClick={() =>
                  updateCartItemQuantity(item.id, item.quantity + 1)
                }
                //to make button unclickable if product stock = 0
                //disabled={item.quantity >= item.stock}
              >
                +
              </button>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <p>Total Price: ${totalPrice}</p>
          <button onClick={handleBuy}>Buy Now</button>
        </div>
      )}
    </div>
  );
}
