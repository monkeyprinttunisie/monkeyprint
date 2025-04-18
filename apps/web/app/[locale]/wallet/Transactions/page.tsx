"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface HistoryItem {
    id: string
    orderNumber: string
    date: string
    description: string
    imageUrl: string
    price: number
    status: string
}

export default function HistoryPage() {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userImage, setUserImage] = useState("/default-avatar.png")
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function fetchOrderHistory() {
            try {
                setIsLoading(true)

                // Fetch data from API
                const response = await fetch("/api/orders")

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()

                if (data.success && data.orders) {
                    // Transform orders into history items
                    const items = data.orders.map((order: any) => ({
                        id: order.id,
                        orderNumber: order.id.slice(0, 8),
                        date: new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                        }),
                        description: `${order.items.length} item${order.items.length > 1 ? "s" : ""}`,
                        imageUrl: order.items[0]?.imageUrl || "/placeholder.svg",
                        price: order.totalPrice,
                        status: order.status,
                    }))

                    setHistoryItems(items)
                } else {
                    // If API call is successful but returns an error
                    setError(data.error || "Failed to fetch order history")
                }
            } catch (error) {
                console.error("Failed to fetch order history:", error)

                // For demo purposes, create mock data if API fails
                const mockItems = [
                    {
                        id: "1",
                        orderNumber: "92287157",
                        date: "April.06",
                        description: "Red dress, elegant design",
                        imageUrl: "/images/product1.jpg",
                        price: 120.0,
                        status: "FULFILLED",
                    },
                    {
                        id: "2",
                        orderNumber: "92287157",
                        date: "April.06",
                        description: "Pink blouse, casual style",
                        imageUrl: "/images/product2.jpg",
                        price: 85.5,
                        status: "FULFILLED",
                    },
                    {
                        id: "3",
                        orderNumber: "92287157",
                        date: "April.06",
                        description: "White top with red bag",
                        imageUrl: "/images/product3.jpg",
                        price: 150.0,
                        status: "CANCELED",
                    },
                    {
                        id: "4",
                        orderNumber: "92287157",
                        date: "April.06",
                        description: "Cream sweater, winter collection",
                        imageUrl: "/images/product4.jpg",
                        price: 95.0,
                        status: "FULFILLED",
                    },
                    {
                        id: "5",
                        orderNumber: "92287157",
                        date: "April.06",
                        description: "Floral pattern top, summer collection",
                        imageUrl: "/images/product5.jpg",
                        price: 75.0,
                        status: "PENDING",
                    },
                ]

                setHistoryItems(mockItems)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrderHistory()
    }, [])

    const handleViewDetails = (id: string) => {
        // In a real app, navigate to order details page
        router.push(`/orders/${id}`)
    }

    const handleBackToWallet = () => {
        router.push("/")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
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
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-md p-4 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-pink-200 cursor-pointer"
                    onClick={handleBackToWallet}
                >
                    <Image src={userImage || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                </div>
                <h1 className="text-2xl font-bold">History</h1>
            </div>

            {/* History Items */}
            <div className="space-y-4">
                {historyItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="flex">
                            {/* Product Image */}
                            <div className="w-1/3 h-32 relative">
                                <Image src={item.imageUrl || "/placeholder.svg"} alt="Product" fill className="object-cover" />
                            </div>

                            {/* Order Details */}
                            <div className="w-2/3 p-3 flex flex-col justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                    <p className="font-medium mt-1">Order #{item.orderNumber}</p>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{item.date}</div>
                                    <button
                                        onClick={() => handleViewDetails(item.id)}
                                        className="text-blue-500 border border-blue-500 rounded-full px-4 py-1 text-sm hover:bg-blue-50"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
