"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "@/actions/orderActions";
import { Order } from "@/types";
enum OrderStatus {
  CANCELED = "CANCELED",
  CONFIRMED = "CONFIRMED",
  PRINTED = "PRINTED",
  FULFILLED = "FULFILLED",
  PAID = "PAID",
  PENDING = "PENDING",
}
interface OrderDetailClientProps {
  id: string;
}

export default function OrderDetailClient({ id }: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Rest of your component remains the same, but uses the id prop directly
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(id);
      if (response.success && response.order) {
        setOrder(response.order as unknown as Order);
      } else {
        setError(response.error || "Failed to fetch order");
      }
    } catch (err) {
      setError("An error occurred while fetching the order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      const response = await updateOrderStatus(id, status);
      if (response.success && response.order) {
        setOrder(response.order as unknown as Order);
      } else {
        alert(response.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the status");
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await deleteOrder(id);
      if (response.success) {
        router.push("/admin/ordersState");
      } else {
        alert(response.error || "Failed to delete order");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the order");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PRINTED":
        return "bg-purple-100 text-purple-800";
      case "FULFILLED":
        return "bg-green-100 text-green-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-raleway font-medium">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="font-raleway font-bold text-xl mb-2">Error</p>
          <p className="font-nunito">{error || "Order not found"}</p>
          <button
            onClick={() => router.push("/admin/ordersState")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 mb-[2vh]">
      <div className="flex items-center mb-6">
        <button onClick={() => router.push("/admin/ordersState")} className="mr-4">
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
        <h1 className="font-raleway font-bold text-2xl">Order Details</h1>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-raleway font-bold text-xl">
            Order #{order.id.slice(0, 8)}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}
          >
            {order.status}
          </span>
        </div>
        <p className="font-nunito text-gray-600">
          {new Date(order.createdAt).toLocaleDateString()}{" "}
          {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-raleway font-bold text-lg mb-3">Items</h3>
        <div className="border rounded-lg overflow-hidden">
          {order.items.map((item, index) => (
            <div
              key={item.id}
              className={`flex p-4 ${index < order.items.length - 1 ? "border-b" : ""}`}
            >
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-nunito font-medium">{item.name}</p>
                <p className="font-nunito text-sm text-gray-600">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-raleway font-bold">{item.price}dt</p>
                <p className="font-nunito text-sm text-gray-600">
                  Total: {(item.price * item.quantity).toFixed(2)}dt
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-raleway font-bold text-lg mb-3">
            Shipping Information
          </h3>
          <div className="border rounded-lg p-4">
            {order.contactInfo ? (
              <>
                <p className="font-nunito font-medium mb-1">Address</p>
                <p className="font-nunito text-gray-600 mb-3">
                  {order.contactInfo.address}
                </p>

                <p className="font-nunito font-medium mb-1">City</p>
                <p className="font-nunito text-gray-600 mb-3">
                  {order.contactInfo.city}
                </p>

                <p className="font-nunito font-medium mb-1">Country</p>
                <p className="font-nunito text-gray-600">
                  {order.contactInfo.country}
                </p>
              </>
            ) : (
              <p className="font-nunito text-gray-500">
                No shipping address provided
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-raleway font-bold text-lg mb-3">
            Contact Information
          </h3>
          <div className="border rounded-lg p-4">
            {order.contactInfo ? (
              <>
                <p className="font-nunito font-medium mb-1">Name</p>
                <p className="font-nunito text-gray-600 mb-3">
                  {order.contactInfo.name}
                </p>

                <p className="font-nunito font-medium mb-1">Phone</p>
                <p className="font-nunito text-gray-600 mb-3">
                  {order.contactInfo.phone}
                </p>

                {order.contactInfo.email && (
                  <>
                    <p className="font-nunito font-medium mb-1">Email</p>
                    <p className="font-nunito text-gray-600">
                      {order.contactInfo.email}
                    </p>
                  </>
                )}
              </>
            ) : (
              <p className="font-nunito text-gray-500">
                No contact information provided
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-raleway font-bold text-lg mb-3">Shipping Method</h3>
        <div className="border rounded-lg p-4">
          <p className="font-nunito font-medium">
            {order.shippingMethod === "STANDARD"
              ? "Standard Delivery"
              : "Express Delivery"}
          </p>
          <p className="font-nunito text-gray-600">
            Fee: {order.shippingFee}dt
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-raleway font-bold text-lg mb-3">Order Summary</h3>
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <p className="font-nunito">Subtotal</p>
            <p className="font-nunito font-medium">
              {(order.totalPrice - order.shippingFee).toFixed(2)}dt
            </p>
          </div>
          <div className="flex justify-between mb-3">
            <p className="font-nunito">Shipping Fee</p>
            <p className="font-nunito font-medium">{order.shippingFee}dt</p>
          </div>
          <div className="flex justify-between font-bold pt-3 border-t">
            <p className="font-raleway">Total</p>
            <p className="font-raleway">{order.totalPrice.toFixed(2)}dt</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-10">
        <div>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white mr-3"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PRINTED">Printed</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="PAID">Paid</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
        <div>
          <button
            onClick={handleDeleteOrder}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete Order
          </button>
        </div>
      </div>
    </div>
  );
}
