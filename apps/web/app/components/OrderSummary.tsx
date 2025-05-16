// OrderSummary.tsx
import { useRouter } from "next/navigation";
import { CartItem, /* ShippingAddress, */ ContactInfo, Order } from "@/types";
import { ShippingMethod } from "@monkeyprint/db";

interface OrderSummaryProps {
  order: {
    id: string;
    cartItems?: CartItem[];
  } | null;
  cart: CartItem[];
  /* shippingAddress: ShippingAddress; */
  contactInfo: ContactInfo;
  shippingMethod: ShippingMethod;
}

export default function OrderSummary({
  order,
  cart,
  /* shippingAddress, */
  contactInfo,
  shippingMethod,
}: OrderSummaryProps) {
  const router = useRouter();
  const cartItems = order?.cartItems || cart;
  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingFee = shippingMethod === "STANDARD" ? 5 : 7;
  const totalPrice = subtotal + shippingFee;

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8 mt-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </div>
        <h1 className="font-raleway font-bold text-[28px] text-[#202020]">
          Order Confirmed!
        </h1>
        <p className="font-nunito text-gray-600 mt-2">
          Thank you for your purchase
        </p>
        {order && (
          <p className="font-nunito text-gray-500 text-sm mt-1">
            Order ID: {order.id.substring(0, 8)}
          </p>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-[#F1F4FE] rounded-lg p-4 mb-4">
        <h2 className="font-raleway font-bold text-[20px] text-[#202020] mb-3">
          Order Summary
        </h2>

        {/* Items list */}
        <div className="mb-4">
          <h3 className="font-raleway font-bold text-[16px] mb-2">Items</h3>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-nunito text-[14px]">{item.name}</p>
                    <p className="font-nunito text-[12px] text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-raleway font-bold">{item.price}dt</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Details */}
        <div className="mb-4">
          <h3 className="font-raleway font-bold text-[16px] mb-2">
            Shipping Details
          </h3>
          <div className="font-nunito text-[14px]">
            <p className="font-nunito">{contactInfo.name}</p>
            <p>{contactInfo.address}</p>
            {/* <p>
              {contactInfo.city}, {contactInfo.postcode}
            </p> */}
            <p>{contactInfo.country}</p>
            <p className="mt-1">Phone: {contactInfo.phone}</p>
            <p>Email: {contactInfo.email}</p>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="mb-4">
          <h3 className="font-raleway font-bold text-[16px] mb-2">
            Delivery Method
          </h3>
          <p className="font-nunito text-[14px]">
            {shippingMethod === "STANDARD"
              ? "Standard Delivery (3-5 days)"
              : "Express Delivery (1-2 days)"}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="border-t pt-3">
          <div className="flex justify-between mb-1">
            <span className="font-nunito">Subtotal</span>
            <span className="font-raleway font-bold">{subtotal}dt</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-nunito">Shipping</span>
            <span className="font-raleway font-bold">{shippingFee}dt</span>
          </div>
          <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-300">
            <span className="font-raleway">Total</span>
            <span className="font-raleway">{totalPrice}dt</span>
          </div>
        </div>
      </div>

      {/* Continue Shopping Button */}
      <div className="mt-auto py-4">
        <button
          onClick={() => router.push("/store/allProducts")}
          className="w-full py-3 px-4 bg-blue-600 text-white font-raleway font-bold text-lg rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
