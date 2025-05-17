"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getOrders, OrderWithItems } from "@/actions/orderActions";
import { getStoreById } from "@/actions/storeActions";
import { useTranslations } from "next-intl";

interface HistoryItem {
  id: string;
  orderNumber: string;
  date: string;
  description: string;
  imageUrl: string;
  price: number;
  status: string;
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userImage, setUserImage] = useState("/default-avatar.png");
  const [storeName, setStoreName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id");

  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"FULFILLED" | "PAID">("FULFILLED");
  const t = useTranslations("HistoryPage");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (session) {
      setUserImage(session.user?.image || "/default-avatar.png");

      if (storeId) {
        fetchOrderHistory();
        fetchStoreInfo();
      } else {
        setError("No store ID provided");
        setIsLoading(false);
      }
    } else if (session === null) {
      router.push("/auth/login");
    }
  }, [session, storeId, router]);

  const fetchStoreInfo = async () => {
    if (!storeId) return;

    try {
      const storeResponse = await getStoreById(storeId);
      if (storeResponse && storeResponse.name) {
        setStoreName(storeResponse.name);
      }
    } catch (err) {
      console.error("Error fetching store info:", err);
    }
  };

  async function fetchOrderHistory() {
    if (!storeId) return;

    try {
      setIsLoading(true);

      // Make sure storeId is being passed and logged
      console.log("Fetching orders for store ID:", storeId);

      // Pass storeId to getOrders function
      const response = await getOrders(storeId);

      if (response.success && response.orders) {
        console.log(
          `Found ${response.orders.length} orders for store ${storeId}`
        );

        // Transform orders into history items
        const items = response.orders.map((order: OrderWithItems) => {
          const imageUrl =
            order.items?.length > 0
              ? order.items[0]?.imageUrl || "/placeholder.svg"
              : "/placeholder.svg";
          return {
            id: order.id,
            orderNumber: order.id.slice(0, 8),
            date: new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            }),
            description: `${order.items.length} item${order.items.length > 1 ? "s" : ""}`,
            imageUrl,
            price: order.totalPrice,
            status: order.status,
          };
        });
        setHistoryItems(items);
      } else {
        // If function call is successful but returns an error
        setError(response.error || "Failed to fetch order history");
      }
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      setError("Failed to fetch order history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  // Filter orders based on active tab
  useEffect(() => {
    const filtered = historyItems.filter((item) => item.status === activeTab);
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when changing tabs
  }, [activeTab, historyItems]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleViewDetails = (item: HistoryItem) => {
    setSelectedOrder(item);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleBackToWallet = () => {
    router.push(`/superAdmin/wallet?id=${storeId}`);
  };

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/wallet")}
          className="px-4 py-2 mt-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
        >
          Back to Stores
        </button>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-amber-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Missing Information</h2>
        <p className="text-gray-600 mb-4 text-center">No store ID provided.</p>
        <button
          onClick={() => router.push("/wallet")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go to Stores List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-4 min-h-screen">
      <div className="mb-4">
        <button
          onClick={() => router.push(`/superAdmin/wallet?id=${storeId}`)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Back to Wallet</span>
        </button>
      </div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-pink-200 cursor-pointer"
          onClick={handleBackToWallet}
        >
          <Image
            src={userImage}
            alt="Profile"
            width={200}
            height={200}
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold">{storeName || "Store"}</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 py-2 font-medium text-center ${
            activeTab === "FULFILLED"
              ? "text-white bg-blue-500 rounded-t-lg"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("FULFILLED")}
        >
          {t("Delivered")}
        </button>
        <button
          className={`flex-1 py-2 font-medium text-center ${
            activeTab === "PAID"
              ? "text-white bg-blue-500 rounded-t-lg"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("PAID")}
        >
          {t("Paid")}
        </button>
      </div>

      {/* History Items */}
      {currentItems.length > 0 ? (
        <div className="space-y-4">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="flex">
                {/* Product Image */}
                <div className="w-1/3 h-32 relative">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt="Product"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Order Details */}
                <div className="w-2/3 p-3 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="font-medium mt-1">
                      Order #{item.orderNumber}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      {item.date}
                    </div>
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-blue-500 border border-blue-500 rounded-full px-4 py-1 text-sm hover:bg-blue-50"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-gray-400 text-6xl mb-4">
            <img src="/icons/paid.png" alt="No Paid Order" />
          </div>
          <p className="text-gray-500 font-medium">
            No {activeTab.toLowerCase()} orders found
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-[90vw] shadow-lg border border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Order Details</h3>
              <button onClick={handleCloseModal} className="text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex mb-4">
              <div className="w-1/3 h-32 relative rounded overflow-hidden">
                <Image
                  src={selectedOrder.imageUrl || "/placeholder.svg"}
                  alt="Product"
                  className="object-cover"
                  width={200}
                  height={200}
                />
              </div>
              <div className="w-2/3 pl-4">
                <p className="font-medium">
                  Order #{selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Date: {selectedOrder.date}
                </p>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      selectedOrder.status === "FULFILLED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  {selectedOrder.price.toFixed(2)} DT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Transactions Button */}
      <div className="fixed bottom-[8.5vh] left-0 right-0 flex justify-center z-10">
        <button
          onClick={() =>
            router.push(`/superAdmin/wallet/invoice?storeId=${storeId}`)
          }
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 flex items-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span>Print Transactions</span>
        </button>
      </div>
    </div>
  );
}
