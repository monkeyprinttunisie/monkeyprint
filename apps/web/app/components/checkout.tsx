"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CartItem, ShippingAddress, ContactInfo } from "@/types";
import { ShippingMethod } from "@monkeyprint/db";
import BottomSheet from "@/components/SlideUpPanel";
import ShippingAddressForm from "@/components/ShippingAddressPanel";
import ContactInfoForm from "@/components/ContactInfoPanel";
import { createOrder } from "@/actions/orderActions";
import OrderSummary from "@/components/OrderSummary";

interface CheckoutProps {
  cart: CartItem[];
  clearCart: () => Promise<void>;
  onBack: () => void;
  onShippingMethodChange: (method: ShippingMethod) => void;
  shippingMethod: ShippingMethod;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Checkout({
  cart,
  clearCart,
  onBack,
  shippingMethod,
  onShippingMethodChange,
  setIsProcessing,
}: CheckoutProps) {
  const router = useRouter();
  const [isShippingAddressSheetOpen, setIsShippingAddressSheetOpen] =
    useState(false);
  const [isContactInfoSheetOpen, setIsContactInfoSheetOpen] = useState(false);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const handleShippingAddressSave = (data: ShippingAddress) => {
    setShippingAddress(data);
    setIsShippingAddressSheetOpen(false);
  };

  const handleContactInfoSave = (data: ContactInfo) => {
    setContactInfo(data);
    setIsContactInfoSheetOpen(false);
  };

  const handleBuy = async () => {
    if (!shippingAddress || !contactInfo) {
      alert("Please complete shipping address and contact information.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await createOrder(
        cart,
        shippingAddress,
        contactInfo,
        shippingMethod
      );

      if (result.success) {
        const cartCopyForSummary = [...cart];
        setOrderSummary({
          ...result.order,
          cartItems: cartCopyForSummary,
        });
        setOrderComplete(true);
        await clearCart();
      } else {
        alert(result.error || "Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      alert("An error occurred while processing your order.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      {orderComplete ? (
        <OrderSummary
          order={orderSummary}
          cart={cart}
          shippingAddress={shippingAddress!}
          contactInfo={contactInfo!}
          shippingMethod={shippingMethod}
        />
      ) : (
        <>
          {" "}
          <div className="mb-6 flex items-center">
            <button onClick={onBack} className="mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h1 className="font-raleway font-bold text-[28px] text-[#202020]">
              Payment
            </h1>
          </div>
          {/* Shipping Address Section */}
          <div
            className="w-full h-[70px] mb-4 bg-[#F1F4FE] rounded-[10px] p-4 flex justify-between items-center"
            onClick={() => setIsShippingAddressSheetOpen(true)}
          >
            <div>
              <h2 className="font-raleway font-bold font-raleway text-[17px] text-[#202020]">
                Shipping Address
              </h2>
              {shippingAddress ? (
                <p className="font-nunito text-[13px] pr-[2vw] text-gray-900">
                  {shippingAddress.address}, {shippingAddress.city}
                </p>
              ) : (
                <p className="font-nunito text-[13px] text-gray-900">
                  Tap to add
                </p>
              )}
            </div>
            <div className="flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center">
              <img
                src="/icons/edit-button.svg"
                className="w-full h-full object-contain translate-y-2"
              />
            </div>
          </div>
          {/* Contact Information Section */}
          <div
            className="w-full h-[70px] mb-4 bg-[#F1F4FE] rounded-[10px] p-4 flex justify-between items-center"
            onClick={() => setIsContactInfoSheetOpen(true)}
          >
            <div>
              <h2 className="font-raleway font-bold font-raleway text-[17px] text-[#202020]">
                Contact Information
              </h2>
              {contactInfo ? (
                <p className="font-nunito text-[13px] text-gray-900">
                  {contactInfo.firstName} {contactInfo.lastName},{" "}
                  {contactInfo.phone}
                </p>
              ) : (
                <p className="font-nunito text-[13px] text-gray-900">
                  Tap to add
                </p>
              )}
            </div>
            <div className="flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center">
              <img
                src="/icons/edit-button.svg"
                className="w-full h-full object-contain translate-y-2"
              />
            </div>
          </div>
          {/* Items Section */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <h2 className="font-raleway font-bold text-[24px] text-[#202020] mb-3">
                Items
              </h2>
              <span className="bg-[#E5EBFC] text-[#202020] ml-[3vw] py-1 -translate-y-[1vh] px-3 rounded-full font-raleway font-bold text-lg">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>
            <div className="space-y-1 max-h-[25vh] overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="relative flex items-center p-2 rounded-lg"
                >
                  <div className="relative w-[60px] h-[60px] rounded-full mr-3 shadow-md border-6 border-white">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="absolute -top-1 -right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#E5EBFC] border-4 border-white text-[12px]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-nunito-sans font-meduim text-[16px]  ml-[3vw] text-black">
                      {item.name}
                    </p>
                  </div>
                  <div>
                    <p className="font-raleway font-bold text-[18px] text-[#202020]">
                      {item.price}dt
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Shipping Methods Section */}
          <div className="my-4">
            <h2 className="font-raleway font-bold text-[24px] text-[#202020] mb-3">
              Shipping Options
            </h2>
            <div className="space-y-3">
              <div
                className={`flex items-center border rounded-lg p-3 ${
                  shippingMethod === "STANDARD"
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => onShippingMethodChange("STANDARD")}
              >
                <div className="mr-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      shippingMethod === "STANDARD"
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {shippingMethod === "STANDARD" && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-raleway font-bold text-[16px] text-[#202020]">
                    Standard Delivery
                  </p>
                  <p className="font-nunito text-sm text-gray-600">
                    3-5 business days
                  </p>
                </div>
                <div>
                  <p className="font-raleway font-bold text-[16px] text-[#202020]">
                    5dt
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center border rounded-lg p-3 ${
                  shippingMethod === "EXPRESS"
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => onShippingMethodChange("EXPRESS")}
              >
                <div className="mr-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      shippingMethod === "EXPRESS"
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {shippingMethod === "EXPRESS" && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-raleway font-bold text-[16px] text-[#202020]">
                    Express Delivery
                  </p>
                  <p className="font-nunito text-sm text-gray-600">
                    1-2 business days
                  </p>
                </div>
                <div>
                  <p className="font-raleway font-bold text-[16px] text-[#202020]">
                    7dt
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            id="buy-button"
            onClick={handleBuy}
            className="hidden"
          ></button>
          <BottomSheet
            isOpen={isShippingAddressSheetOpen}
            onClose={() => setIsShippingAddressSheetOpen(false)}
            title="Shipping Address"
          >
            <ShippingAddressForm
              initialData={shippingAddress || undefined}
              onSave={handleShippingAddressSave}
              onCancel={() => setIsShippingAddressSheetOpen(false)}
            />
          </BottomSheet>
          <BottomSheet
            isOpen={isContactInfoSheetOpen}
            onClose={() => setIsContactInfoSheetOpen(false)}
            title="Contact Information"
          >
            <ContactInfoForm
              initialData={contactInfo || undefined}
              onSave={handleContactInfoSave}
              onCancel={() => setIsContactInfoSheetOpen(false)}
            />
          </BottomSheet>
        </>
      )}
    </div>
  );
}
