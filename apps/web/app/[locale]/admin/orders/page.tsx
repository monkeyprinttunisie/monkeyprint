"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/actions/orderActions";
import { Order } from "@/types";
import { OrderStatus } from "@monkeyprint/db";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((order) => order.status === statusFilter);
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      if (response.success && response.orders) {
        setOrders(response.orders);
      } else {
        setError(response.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await updateOrderStatus(orderId, status);
      if (response.success) {
        // Update the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );
      } else {
        alert(response.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the status");
    }
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      const response = await deleteOrder(orderToDelete);
      if (response.success) {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderToDelete)
        );
      } else {
        alert(response.error || "Failed to delete order");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the order");
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-raleway font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="font-raleway font-bold text-xl mb-2">Error</p>
          <p className="font-nunito">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[10vh] bg-white p-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-raleway font-bold text-2xl">Orders</h1>
        <div className="flex-1 max-w-[40vw]">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "ALL")
            }
            className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PRINTED">Printed</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="PAID">Paid</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="font-nunito text-gray-500">No orders found</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <p className="font-nunito text-gray-500">
            No {statusFilter.toLowerCase()} orders found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-raleway font-bold">
                  Order #{order.id.slice(0, 8)}
                </h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="font-nunito text-sm mb-3">
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()} •{" "}
                  {order.items.length} items •{order.totalPrice.toFixed(2)}dt
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {order.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="w-10 h-10 rounded bg-gray-100 overflow-hidden"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-medium">
                      +{order.items.length - 3}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PRINTED">Printed</option>
                  <option value="FULFILLED">Fulfilled</option>
                  <option value="PAID">Paid</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewOrder(order.id)}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteClick(order.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-[rgba(0,66,224,0.12)] backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="mb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Order
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this order? This action cannot
                be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={cancelDelete}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
