"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import WalletHeader from "@/components/walletHeader"
import WalletStats from "@/components/walletStats"
import WalletCalendar from "@/components/walletCalendar"
import { useTranslations } from "next-intl"
// This would come from your database in a real app
interface WalletData {
    total: number
    delivered: number
    returned: number
    currency: string
    orderCounts: {
        delivered: number
        shipping: number
        returned: number
    }
}

export default function WalletPage() {
    const [userImage, setUserImage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
const t = useTranslations("WalletPage")
    const [walletData, setWalletData] = useState<WalletData>({
        total: 0,
        delivered: 0,
        returned: 0,
        currency: "DT",
        orderCounts: {
            delivered: 0,
            shipping: 0,
            returned: 0
        }
    })
    const [error, setError] = useState<string | null>(null)
    const { data: session } = useSession()
    const router = useRouter()

    const fetchWalletData = async (date?: Date) => {
        if (!session) return;

        setIsLoading(true);
        try {
            // Create URL with date parameters if a date is provided
            let url = `/api/wallet`;
            if (date) {
                const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                url += `?date=${formattedDate}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            setWalletData(data);
        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
            setError("Failed to load wallet data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (session) {
            setUserImage(session.user?.image || "/default-avatar.png");
            fetchWalletData(selectedDate || undefined);
        } else if (session === null) {
            router.push("/auth/login");
        }
    }, [session, router]);

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

    const handleViewHistory = () => {
        router.push("/wallet/Transactions");
    };

    return (
        <div className="container mx-auto max-w-md p-4 min-h-screen">
            <WalletHeader imageUrl={userImage} title={t("wallet")} />
            <div className="mt-6">
                <WalletCalendar
                    onDateSelect={handleDateSelect}
                    initialDate={selectedDate || undefined}
                />
            </div>

            <div className="p-4">
                {error ? (
                    <div className="text-red-500 p-4 bg-red-50 rounded-md mb-4">{error}</div>
                ) : (
                    <WalletStats
                        total={walletData.total || 0}
                        delivered={walletData.delivered || 0}
                        returned={walletData.returned || 0}
                        currency="DT"
                        orderCounts={walletData.orderCounts || { delivered: 0, shipping: 0, returned: 0 }}
                    />
                )}
            </div>

            <button
                className="w-full text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
                style={{ background: 'linear-gradient(to right, #3751FF, #5F74FF)' }}
                onClick={handleViewHistory}
            >
                {t("transactions")}
            </button>
        </div>
    );
}