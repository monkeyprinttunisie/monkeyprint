"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/button";
import { updateProduct } from "@/actions/productActions";
export default function Cart() {
  const { cart, updateCartItemQuantity, removeFromCart, clearCart } = useCart();

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
    <div className="max-h-[92vh]">
      {/* <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Cart({cart.reduce((total, item) => total + item.quantity, 0)})
      </Button> */}
      {/* {isOpen && ( */}
      <div className="fixed inset-0 bg-white p-4">
        <div className="flex items-center mb-2">
          <span>
            <h2 className="font-raleway font-bold text-[28px] text-[#202020]">
              Cart
            </h2>
          </span>
          <span className="bg-[#E5EBFC] text-[#202020] ml-2 py-1 px-3 rounded-full font-raleway font-bold text-lg">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        </div>
        <div className="flex items-center justify-center my-3">
          {cart.length === 0 && (
            <img src="icons/empty-cart.svg" alt="empty cart" />
          )}
        </div>
        <div className="max-h-[73vh] overflow-y-auto rounded-[4%]">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center pb-4 mb-4">
              <span className="relative inline-block">
                <div className="p-1.5 w-[40vw] mr-4 bg-white shadow-md shadow-[rgba(0,0,0,0.1)] rounded-[9px]">
                  <img
                    className="h-[15vh] rounded-[9px]"
                    src={item.imageUrl}
                    alt={item.name}
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute bottom-4 left-4"
                  >
                    <img
                      src="/icons/delete-icon.svg"
                      alt="Delete icon"
                      width="42"
                      height="42"
                      onClick={(e) =>
                        (e.currentTarget.src = "/icons/delete-icon-clicked.svg")
                      }
                    />
                  </button>
                </div>
              </span>
              <span>
                <p className="font-nunito font-normal text-[12px] leading-[16px] text-[#000000]">
                  {item.name}
                </p>
                {/* <p className="text-gray-700">
                  Total: ${item.price * item.quantity}
                </p> */}

                <div className="flex mt-2 w-[45vw] justify-between items-center">
                  <div>
                    <p className="font-raleway font-bold text-[18px] text-[#202020]">
                      {item.price}dt
                    </p>
                  </div>

                  <div className="flex justify-between items-center gap-1">
                    <button
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                      /* disabled={item.quantity <= 1} */
                      className="rounded-full w-9 h-9  border-[#004BFE] border-3 hover:bg-gray-300"
                    >
                      <span className="font-raleway font-bold text-[24px] text-[#004BFE]">
                        -
                      </span>
                    </button>
                    <span className=" px-4 bg-[#E5EBFC] rounded-[7px]">
                      <p className="font-raleway my-1.5 font-medium text-[16px] text-black">
                        {item.quantity}
                      </p>
                    </span>
                    <button
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                      //to make button unclickable if product stock = 0
                      //disabled={item.quantity >= item.stock}
                      className="rounded-full w-9 h-9  border-[#004BFE] border-3 hover:bg-gray-300"
                    >
                      <span className="font-raleway font-bold text-[24px] text-[#004BFE]">
                        +
                      </span>
                    </button>
                  </div>
                </div>
              </span>
            </div>
          ))}
        </div>
        <div className="fixed bottom-[8vh] left-0 w-full p-4 bg-[#E5EBFC]">
          <div className="flex items-center justify-between">
            <span>
              <p className="font-bold text-gray-800">
                <span className="font-raleway font-extrabold text-[20px] text-black">
                  Total{" "}
                </span>
                <span className="font-raleway font-bold text-[18px] text-[#202020]">
                  {totalPrice}dt
                </span>
              </p>
            </span>
            <span>
              <button
                onClick={handleBuy}
                disabled={cart.length === 0}
                className={`p-2 px-7.5 rounded-[11px] ${
                  cart.length > 0
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-white text-[#0C0C0C] cursor-not-allowed"
                }`}
              >
                Checkout
              </button>
            </span>
          </div>
        </div>
      </div>
      {/* )} */}
    </div>
  );
}
