"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Checkout from "@/components/checkout";
import { ShippingMethod } from "@monkeyprint/db";

export default function Cart() {
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const updateCartItemQuantity = useCartStore(
    (state) => state.updateCartItemQuantity
  );
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  // For checkout mode
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("STANDARD");

  // Calculate total price
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingFee = isCheckoutMode
    ? shippingMethod === "STANDARD"
      ? 5
      : 7
    : 0;
  const totalPrice = subtotal + shippingFee;

  const handleCheckout = () => {
    setIsCheckoutMode(true);
  };

  const handleBackToCart = () => {
    setIsCheckoutMode(false);
  };

  const handleBuy = () => {
    setIsProcessing(true);
    document.getElementById("buy-button")?.click();
  };

  const handleShippingMethodChange = (method: ShippingMethod) => {
    setShippingMethod(method);
  };

  return (
    <div className="max-h-[92vh]">
      <div className="fixed inset-0 bg-white p-4">
        {!isCheckoutMode ? (
          // Cart View
          <>
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
                <img src="/icons/empty-cart.svg" alt="empty cart" />
              )}
            </div>
            <div className="max-h-[67.5vh] overflow-y-auto rounded-[4%]">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center pb-4 mb-4">
                  <span className="relative inline-block">
                    <div className="p-1.5 w-[36vw] mr-2 bg-white shadow-md shadow-[rgba(0,0,0,0.1)] rounded-[9px]">
                      <img
                        className="h-[15vh] rounded-[9px]"
                        src={item.imageUrl}
                        alt={item.name}
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="absolute bottom-3 left-3"
                      >
                        <img
                          src="/icons/delete-icon.svg"
                          alt="Delete icon"
                          width="38"
                          height="38"
                          onClick={(e) =>
                            (e.currentTarget.src =
                              "/icons/delete-icon-clicked.svg")
                          }
                        />
                      </button>
                    </div>
                  </span>
                  <span>
                    <p className="font-nunito font-normal text-[12px] leading-[16px] text-[#000000]">
                      {item.name}
                    </p>

                    <div className="flex mt-2 w-[45vw] justify-between items-center">
                      <div>
                        <p className="font-raleway font-bold text-[16px] text-[#202020]">
                          {item.price}dt
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -right-7 -top-4.5 flex justify-between items-center gap-1">
                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                            className="rounded-full w-8 h-8 border-[#004BFE] border-3 hover:bg-gray-300 font-raleway font-bold text-[18px] text-[#004BFE]"
                          >
                            -
                          </button>

                          <span className="px-4 bg-[#E5EBFC] rounded-[7px]">
                            <p className="font-raleway my-1.5 font-medium text-[16px] text-black">
                              {item.quantity}
                            </p>
                          </span>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity + 1)
                            }
                            className="rounded-full w-8 h-8 border-[#004BFE] border-3 hover:bg-gray-300 font-raleway font-bold text-[18px] text-[#004BFE]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Checkout View
          <Checkout
            cart={cart}
            clearCart={clearCart}
            onBack={handleBackToCart}
            shippingMethod={shippingMethod}
            onShippingMethodChange={handleShippingMethodChange}
            setIsProcessing={setIsProcessing}
            setIsOrderComplete={setIsOrderComplete}
          />
        )}

        {/* Total & Checkout/Buy Button (Always visible) */}
        {!isOrderComplete && (
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
                {!isCheckoutMode ? (
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className={`p-2 px-7.5 rounded-[11px] ${
                      cart.length > 0
                        ? "bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ease-in-out active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                        : "bg-white text-[#0C0C0C] cursor-not-allowed"
                    }`}
                  >
                    Checkout
                  </button>
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={cart.length === 0 || isProcessing}
                    className={`p-2 px-7.5 rounded-[11px] min-w-[90px] ${
                      cart.length > 0
                        ? "bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ease-in-out active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                        : "bg-white text-[#0C0C0C] cursor-not-allowed"
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex justify-center items-center">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      "Buy"
                    )}
                  </button>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
