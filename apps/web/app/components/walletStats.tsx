"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
interface WalletStatsProps {
    total: number;
    delivered: number;
    returned: number;
    currency: string;
    orderCounts: {
        delivered: number;
        shipping: number;
        returned: number;
    };
}

export default function WalletStats({ total, delivered, returned, currency, orderCounts }: WalletStatsProps) {
    const [activeTab, setActiveTab] = useState<"total" | "delivered" | "returned">("total")
const t = useTranslations("WalletStats")
    const stats = [
        {
            id: "total",
            label: t("total"),
            value: total || 0,
            color: "text-blue-600",
        },
        {
            id: "delivered",
            label: t("delivered"),
            value: delivered || 0,
            color: "text-blue-600",
        },
        {
            id: "returned",
            label: t("returned"),
            value: returned || 0,
            color: "text-red-500",
        },
    ]
    const currentStat = stats.find((stat) => stat.id === activeTab) || stats[0]

    const handlePrevious = () => {
        const currentIndex = stats.findIndex((stat) => stat.id === activeTab)
        const newIndex = (currentIndex - 1 + stats.length) % stats.length
        setActiveTab(stats[newIndex].id as "total" | "delivered" | "returned")
    }

    const handleNext = () => {
        const currentIndex = stats.findIndex((stat) => stat.id === activeTab)
        const newIndex = (currentIndex + 1) % stats.length
        setActiveTab(stats[newIndex].id as "total" | "delivered" | "returned")
    }

    return (
        <div className="mb-6">
    

            <div className="relative flex items-center justify-center mb-6">
                <button
                    onClick={handlePrevious}
                    className="absolute left-0 p-2 text-gray-500 hover:text-blue-600"
                    aria-label="Previous stat"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="w-48 h-48 rounded-full border-8 border-gray-100 flex flex-col items-center justify-center shadow-lg">
                    <div className={`text-sm font-medium ${currentStat.color}`}>{currentStat.label}</div>
                    <div className="text-2xl font-bold mt-1">
                        {currentStat.value.toFixed(2)} {currency}
                    </div>
                </div>

                <button
                    onClick={handleNext}
                    className="absolute right-0 p-2 text-gray-500 hover:text-blue-600"
                    aria-label="Next stat"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="flex justify-center gap-4 mb-4">
                <div className="flex flex-col items-center rounded-full ">
                    <div className="rounded-full bg-white shadow-md p-2">
                        <div className="w-14 h-14 rounded-full  flex items-center justify-center text-white  font-semibold" style={{ background: 'linear-gradient(to right, #3751FF, #5F74FF)' }}
                        >
                            {orderCounts.delivered}
                        </div>
                    </div>
                    <span className="text-xs mt-1 text-gray-600">{t("delivered")}</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="rounded-full bg-white shadow-md p-2">

                        <div className="w-14 h-14 rounded-full  flex items-center justify-center text-white  font-semibold" style={{ background: 'linear-gradient(to right, #3751FF, #5F74FF)' }}
                        >
                            {orderCounts.shipping}
                        </div>
                    </div>
                    <span className="text-xs mt-1 text-gray-600">{t("shipping")}</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="rounded-full bg-white shadow-md p-2">
                        <div className="w-14 h-14 rounded-full  flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(to right, #3751FF, #5F74FF)' }}
                        >
                            {orderCounts.returned}
                        </div>
                    </div>
                    <span className="text-xs mt-1 text-gray-600">{t("returned")}</span>
                </div>
            </div>


        </div>
    )
}
