"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getOrders } from "@/actions/orderActions"
import { useSession } from "next-auth/react"
import { Printer, ChevronDown, ChevronUp } from "lucide-react"

export default function InvoicePage({ params }: { params: { id: string } }) {
    const id = params.id
    const router = useRouter()
    const { data: session } = useSession()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedDelivered, setExpandedDelivered] = useState(true)
    const [expandedReturned, setExpandedReturned] = useState(true)

    // Get current date for the invoice
    const currentDate = new Date().toLocaleDateString()

    useEffect(() => {
        // Create a style element
        const style = document.createElement("style")
        style.innerHTML = `
        @media print {
          /* Hide the specific navbar */
          div.fixed.bottom-0.left-0.h-\\[8vh\\].right-0.bg-white.shadow-lg.p-4.flex.justify-around.items-center,
          
          /* Hide all navigation and app shell elements */
          header:not(.print-header), 
          nav, 
          footer:not(.print-footer),
          aside,
          .navbar,
          .sidebar,
          .app-header,
          .app-footer,
          .navigation,
          .nav-container,
          .menu-container,
          .print\\:hidden {
            display: none !important;
          }
          
          /* Ensure the invoice takes up the full page */
          body, html {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          
          /* Make sure the invoice content is visible */
          .print\\:block {
            display: block !important;
          }
        }
      `

        // Add the style to the document head
        document.head.appendChild(style)

        // Clean up on component unmount
        return () => {
            document.head.removeChild(style)
        }
    }, [])

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true)

                // Fetch all orders
                const response = await getOrders()
                if (response.success && response.orders) {
                    setOrders(response.orders)
                } else {
                    setError(response.error || "Failed to fetch orders")
                }
            } catch (err) {
                setError("An error occurred while fetching orders")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const handlePrint = () => {
        window.print()
    }

    // Filter orders by status
    const fulfilledOrders = orders.filter((order) => order.status === "FULFILLED")
    const canceledOrders = orders.filter((order) => order.status === "CANCELED")

    // Calculate totals
    const deliveredTotal = fulfilledOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    //calculate the number of returned orders
    const returnedCount = orders.filter((o) => o.status === "CANCELED").length

    // Calculate MonkeyPrint's earnings (10% of delivered total after fees)
    const calculateMonkeyPrintEarnings = (order: any) => {
        const shippingMethod = order.shippingMethod || "STANDARD" // Default to STANDARD
        const deliveryFee = shippingMethod === "EXPRESS" ? 7 : 5
        const totalAfterFees = order.totalPrice - deliveryFee
        return totalAfterFees * 0.1
    }

    if (loading) {
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
                <button onClick={() => router.back()} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Go Back
                </button>
            </div>
        )
    }

    // Calculate total delivery fees
    const totalDeliveryFees = fulfilledOrders.reduce((sum, order) => {
        const shippingMethod = order.shippingMethod || "STANDARD"
        return sum + (shippingMethod === "EXPRESS" ? 7 : 5)
    }, 0)

    // Calculate total MonkeyPrint earnings
    const totalMonkeyPrintEarnings = fulfilledOrders.reduce((sum, order) => sum + calculateMonkeyPrintEarnings(order), 0)

    // Calculate total return fees
    const totalReturnFees = canceledOrders.length * 5

    // Calculate net earnings
    const netEarnings = deliveredTotal - totalDeliveryFees - totalReturnFees - totalMonkeyPrintEarnings

    return (
        <div className="max-w-4xl mx-auto p-3 sm:p-8 bg-white">
            {/* Print-only header - will show when printing */}
            <div className="print:block hidden print-header">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">TRANSACTION SUMMARY</h1>
                </div>
            </div>

            {/* Screen-only header with print button - will hide when printing */}
            <div className="print:hidden mb-4 sm:mb-6 flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold">Transaction Summary</h1>
                <button
                    onClick={handlePrint}
                    className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-blue-600 flex items-center"
                >
                    <Printer className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Print</span>
                </button>
            </div>

            {/* Company header with logo and store info */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 border-b pb-4 sm:pb-6 gap-2">
                <div className="flex items-center">
                    <div className="mr-3 sm:mr-4">
                        <img src="/images/mp.png" alt="MonkeyPrint" className="h-10 sm:h-16 w-auto" />
                    </div>
                    <div>
                        <p className="text-sm sm:text-base text-gray-600">Store: {session?.user?.name || "Customer Store"}</p>
                    </div>
                </div>
                <div className="text-sm sm:text-base sm:text-right">
                    <p className="text-gray-600">Date: {currentDate}</p>
                </div>
            </div>

            {/* Delivered Orders Section */}
            <div className="mb-6 sm:mb-8">
                <div
                    className="flex justify-between items-center cursor-pointer mb-2"
                    onClick={() => setExpandedDelivered(!expandedDelivered)}
                >
                    <h3 className="font-bold text-base sm:text-lg">Delivered Orders</h3>
                    {expandedDelivered ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>

                {expandedDelivered &&
                    (fulfilledOrders.length > 0 ? (
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                            {/* Desktop table - hidden on mobile */}
                            <table className="hidden sm:table w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">Order #</th>
                                        <th className="border p-2 text-left">Date</th>
                                        <th className="border p-2 text-left">Items</th>
                                        <th className="border p-2 text-left">Order Total</th>
                                        <th className="border p-2 text-left">Delivery Fee</th>
                                        <th className="border p-2 text-left">MonkeyPrint (10%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fulfilledOrders.map((order) => {
                                        const shippingMethod = order.shippingMethod || "STANDARD"
                                        const deliveryFee = shippingMethod === "EXPRESS" ? 7 : 5
                                        const monkeyPrintEarnings = calculateMonkeyPrintEarnings(order)

                                        return (
                                            <tr key={order.id}>
                                                <td className="border p-2">#{order.id.slice(0, 8)}</td>
                                                <td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="border p-2">{order.items.length}</td>
                                                <td className="border p-2">{order.totalPrice.toFixed(2)} DT</td>
                                                <td className="border p-2">{deliveryFee.toFixed(2)} DT</td>
                                                <td className="border p-2">{monkeyPrintEarnings.toFixed(2)} DT</td>
                                            </tr>
                                        )
                                    })}
                                    {/* Total row */}
                                    <tr className="bg-gray-50 font-medium">
                                        <td className="border p-2" colSpan={3}>
                                            Total
                                        </td>
                                        <td className="border p-2">{deliveredTotal.toFixed(2)} DT</td>
                                        <td className="border p-2">{totalDeliveryFees.toFixed(2)} DT</td>
                                        <td className="border p-2">{totalMonkeyPrintEarnings.toFixed(2)} DT</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Mobile cards - shown only on mobile */}
                            <div className="sm:hidden space-y-3 px-3">
                                {fulfilledOrders.map((order) => {
                                    const shippingMethod = order.shippingMethod || "STANDARD"
                                    const deliveryFee = shippingMethod === "EXPRESS" ? 7 : 5
                                    const monkeyPrintEarnings = calculateMonkeyPrintEarnings(order)

                                    return (
                                        <div key={order.id} className="border rounded-lg p-3 bg-white shadow-sm">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Order #:</span>
                                                <span>#{order.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Date:</span>
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Items:</span>
                                                <span>{order.items.length}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Total:</span>
                                                <span>{order.totalPrice.toFixed(2)} DT</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Delivery Fee:</span>
                                                <span>{deliveryFee.toFixed(2)} DT</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">MonkeyPrint:</span>
                                                <span>{monkeyPrintEarnings.toFixed(2)} DT</span>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Mobile totals card */}
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between font-medium">
                                        <span>Total Amount:</span>
                                        <span>{deliveredTotal.toFixed(2)} DT</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span>Total Delivery Fees:</span>
                                        <span>{totalDeliveryFees.toFixed(2)} DT</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span>Total Commission:</span>
                                        <span>{totalMonkeyPrintEarnings.toFixed(2)} DT</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-sm sm:text-base">No delivered orders found.</p>
                    ))}
            </div>

            {/* Returned Orders Section */}
            <div className="mb-6 sm:mb-8">
                <div
                    className="flex justify-between items-center cursor-pointer mb-2"
                    onClick={() => setExpandedReturned(!expandedReturned)}
                >
                    <h3 className="font-bold text-base sm:text-lg">Returned Orders</h3>
                    {expandedReturned ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>

                {expandedReturned &&
                    (canceledOrders.length > 0 ? (
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                            {/* Desktop table - hidden on mobile */}
                            <table className="hidden sm:table w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">Order #</th>
                                        <th className="border p-2 text-left">Date</th>
                                        <th className="border p-2 text-left">Items</th>
                                        <th className="border p-2 text-left">Return Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {canceledOrders.map((order) => {
                                        const returnFee = 5 // Fixed return fee

                                        return (
                                            <tr key={order.id}>
                                                <td className="border p-2">#{order.id.slice(0, 8)}</td>
                                                <td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="border p-2">{order.items.length}</td>
                                                <td className="border p-2">{returnFee.toFixed(2)} DT</td>
                                            </tr>
                                        )
                                    })}
                                    {/* Total row */}
                                    <tr className="bg-gray-50 font-medium">
                                        <td className="border p-2" colSpan={3}>
                                            Total
                                        </td>
                                        <td className="border p-2">{totalReturnFees.toFixed(2)} DT</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Mobile cards - shown only on mobile */}
                            <div className="sm:hidden space-y-3 px-3">
                                {canceledOrders.map((order) => {
                                    const returnFee = 5 // Fixed return fee

                                    return (
                                        <div key={order.id} className="border rounded-lg p-3 bg-white shadow-sm">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Order #:</span>
                                                <span>#{order.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Date:</span>
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Items:</span>
                                                <span>{order.items.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Return Fee:</span>
                                                <span>{returnFee.toFixed(2)} DT</span>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Mobile totals card */}
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between font-medium">
                                        <span>Total Return Fees:</span>
                                        <span>{totalReturnFees.toFixed(2)} DT</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-sm sm:text-base">No returned orders found.</p>
                    ))}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 mt-6 sm:mt-8">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Final Summary</h3>
                <div className="flex justify-end">
                    <div className="w-full sm:w-1/2">
                        <div className="flex justify-between mb-2 text-sm sm:text-base">
                            <span className="font-medium">Delivered Total:</span>
                            <span>{deliveredTotal.toFixed(2)} DT</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm sm:text-base">
                            <span className="font-medium">Returned orders:</span>
                            <span>{returnedCount}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm sm:text-base">
                            <span className="font-medium">Delivery Fees:</span>
                            <span>{totalDeliveryFees.toFixed(2)} DT</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm sm:text-base">
                            <span className="font-medium">Return Fees:</span>
                            <span>{totalReturnFees.toFixed(2)} DT</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm sm:text-base">
                            <span className="font-medium">MonkeyPrint Commission:</span>
                            <span>{totalMonkeyPrintEarnings.toFixed(2)} DT</span>
                        </div>
                        <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2 mt-2">
                            <span>Net Earnings:</span>
                            <span>{netEarnings.toFixed(2)} DT</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with notes and terms */}
            <div className="mt-8 sm:mt-12 border-t pt-4 sm:pt-6 text-xs sm:text-sm text-gray-600 print-footer">
                <p className="mb-2">Thank you for your business with MonkeyPrint!</p>
                <p>For any questions regarding this summary, please contact MonkeyPrint support.</p>
            </div>
        </div>
    )
}
