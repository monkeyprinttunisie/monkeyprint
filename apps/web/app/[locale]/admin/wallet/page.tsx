"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import WalletHeader from "@/components/walletHeader";
import WalletStats from "@/components/walletStats";
import WalletCalendar from "@/components/walletCalendar";
import { useTranslations } from "next-intl";
import { getWalletData } from "@/actions/walletActions";
import { getStoreById, getStoreNetEarning } from "@/actions/storeActions";

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
  netEarnings?: number;
}

export default function StoreWalletPage() {
  const [storeImage, setStoreImage] = useState("/default-store.png");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAllTime, setIsAllTime] = useState(true); // New state to track all-time view
  const t = useTranslations("WalletPage");
  const [storeName, setStoreName] = useState("");
  const initialLoadComplete = useRef(false);
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
    netEarnings: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id");

  const fetchWalletData = async (date?: Date) => {
    if (date && !initialLoadComplete.current) {
      return;
    }

    if (!storeId) {
      setError("No store ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Determine if we're viewing all-time data
      setIsAllTime(!date);

      if (date) {
        // Format date if provided for specific date view
        const formattedDate = date.toISOString().split("T")[0];

        // Use server action for specific date
        const result = await getWalletData(storeId, formattedDate);

        if (!result.success) {
          throw new Error(result.error || "Failed to load data");
        }

        if (result.data) {
          setWalletData(result.data);
        } else {
          throw new Error("No data returned");
        }
      } else {
        // Fetch all-time data using getStoreNetEarning
        const netEarningResult = await getStoreNetEarning(storeId);

        if (!netEarningResult.success || !netEarningResult.data) {
          throw new Error(
            netEarningResult.error || "Failed to load net earnings"
          );
        }

        // Also fetch the order counts data using getWalletData with no date filter
        const walletResult = await getWalletData(storeId);

        if (!walletResult.success) {
          throw new Error(walletResult.error || "Failed to load wallet data");
        }

        // Now we're sure netEarningResult.data exists
        const netEarningData = netEarningResult.data;

        // Combine the data from both sources
        setWalletData({
          total: netEarningData.netEarnings || 0,
          delivered: netEarningData.deliveredTotal || 0,
          returned: netEarningData.totalReturnFees || 0,
          currency: "DT",
          deliveredProductCount: netEarningData.fulfilledOrdersCount || 0,
          returnedProductCount: netEarningData.canceledOrdersCount || 0,
          orderCounts: walletResult.data
            ? walletResult.data.orderCounts
            : {
                delivered: netEarningData.fulfilledOrdersCount || 0,
                shipping: 0,
                returned: netEarningData.canceledOrdersCount || 0,
              },
          netEarnings: netEarningData.netEarnings || 0,
        });
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
        fetchWalletData(); // Default to all-time data (no date parameter)

        setTimeout(() => {
          initialLoadComplete.current = true;
        }, 500);
      } else {
        setError("No store ID provided");
        setIsLoading(false);
      }
    } else if (session === null) {
      router.push("/auth/login");
    }
  }, [session, storeId, router]);

  const handleDateSelect = (date: Date) => {
    if (initialLoadComplete.current) {
      setSelectedDate(date);
      fetchWalletData(date);
    }
  };

  // New function to reset to all-time view
  const handleResetToAllTime = () => {
    setSelectedDate(null);
    fetchWalletData();
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
          onClick={() => router.push("/auth/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go to Sign in page
        </button>
      </div>
    );
  }

  const handleViewHistory = () => {
    router.push(`/admin/wallet/invoice?storeId=${storeId}`);
  };

  return (
    <div className="container mx-auto max-w-md p-4 min-h-screen">
      <WalletHeader
        imageUrl={storeImage}
        title={`${storeName || "Store"} ${t("wallet")}`}
      />

      <div className="mt-6">
        {/* Add a view mode indicator */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {isAllTime ? t("all_time_view") : t("date_specific_view")}
          </span>
          {!isAllTime && (
            <button
              onClick={handleResetToAllTime}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t("view_all_time")}
            </button>
          )}
        </div>
        <WalletCalendar
          onDateSelect={handleDateSelect}
          initialDate={selectedDate || undefined}
          disableAutoSelection={true}
        />
      </div>

      <div className="p-4">
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-md mb-4">
            {error}
          </div>
        ) : (
          <WalletStats
            total={walletData.netEarnings || walletData.total || 0}
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
