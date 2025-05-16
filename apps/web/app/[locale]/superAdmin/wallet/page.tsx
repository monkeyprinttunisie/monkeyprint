"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import WalletHeader from "@/components/walletHeader";
import WalletStats from "@/components/walletStats";
import WalletCalendar from "@/components/walletCalendar";
import { useTranslations } from "next-intl";
import { getWalletData } from "@/actions/walletActions";
import { getStoreById } from "@/actions/storeActions";

interface WalletData {
  total: number;
  delivered: number;
  returned: number;
  currency: string;
  deliveredProductCount: number;
  returnedProductCount: number;
  orderCounts: {
    delivered: number;
    shipping: number;
    returned: number;
  };
}

export default function StoreWalletPage() {
  const [storeImage, setStoreImage] = useState("/default-store.png");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const t = useTranslations("WalletPage");
  const [storeName, setStoreName] = useState("");
  const [walletData, setWalletData] = useState<WalletData>({
    total: 0,
    delivered: 0,
    returned: 0,
    currency: "DT",
    deliveredProductCount: 0,
    returnedProductCount: 0,
    orderCounts: {
      delivered: 0,
      shipping: 0,
      returned: 0,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id");

  const fetchWalletData = async (date?: Date) => {
    if (!storeId) {
      setError("No store ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Format date if provided
      const formattedDate = date ? date.toISOString().split("T")[0] : undefined;

      // Use server action instead of API call
      const result = await getWalletData(storeId, formattedDate);

      if (!result.success) {
        throw new Error(result.error || "Failed to load data");
      }

      // Add null check here
      if (result.data) {
        setWalletData(result.data);
      } else {
        throw new Error("No data returned");
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      setError("Failed to load wallet data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch store data and wallet data on mount
  useEffect(() => {
    if (session) {
      if (storeId) {
        // Fetch store info to get the name
        const fetchStoreInfo = async () => {
          try {
            const storeResponse = await getStoreById(storeId);
            if (storeResponse) {
              if (storeResponse.name) {
                setStoreName(storeResponse.name);
              }

              // Set the store image if it exists, otherwise use default
              if (storeResponse.image) {
                setStoreImage(storeResponse.image);
              } else {
                setStoreImage("/default-store.png");
              }
            }
          } catch (err) {
            console.error("Error fetching store info:", err);
          }
        };

        fetchStoreInfo();
        fetchWalletData(selectedDate || undefined);
      } else {
        setError("No store ID provided");
        setIsLoading(false);
      }
    } else if (session === null) {
      router.push("/auth/login");
    }
  }, [session, storeId, router]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    fetchWalletData(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-600 mb-4 text-center">No store ID provided</p>
        <button
          onClick={() => router.push("/superAdmin/wallets")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go to Store List
        </button>
      </div>
    );
  }

  const handleViewHistory = () => {
    router.push(`/superAdmin/wallet/transactions?id=${storeId}`);
  };

  const handleBackToStores = () => {
    router.push("/superAdmin/dashboard");
  };

  return (
    <div className="container mx-auto max-w-md p-4 min-h-screen">
      <div className="mb-4">
        <button
          onClick={handleBackToStores}
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
          <span className="font-medium"> Back to Stores</span>
        </button>
      </div>
      <WalletHeader
        imageUrl={storeImage}
        title={`${storeName || "Store"} ${t("wallet")}`}
      />

      <div className="mt-6">
        <WalletCalendar
          onDateSelect={handleDateSelect}
          initialDate={selectedDate || undefined}
        />
      </div>

      <div className="p-4">
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-md mb-4">
            {error}
          </div>
        ) : (
          <WalletStats
            total={walletData.total || 0}
            delivered={walletData.delivered || 0}
            returned={walletData.returned || 0}
            currency="DT"
            orderCounts={
              walletData.orderCounts || {
                delivered: 0,
                shipping: 0,
                returned: 0,
              }
            }
          />
        )}
      </div>

      <button
        className="w-full text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
        style={{ background: "linear-gradient(to right, #3751FF, #5F74FF)" }}
        onClick={handleViewHistory}
      >
        {t("transactions")}
      </button>
    </div>
  );
}
