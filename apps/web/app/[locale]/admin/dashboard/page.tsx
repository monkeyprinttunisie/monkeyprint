"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useRouter } from "next/navigation";
import { getOrdersByStoreId } from "@/actions/orderActions";
import { getStoreById } from "@/actions/storeActions";
import { getUserStoreId } from "@/actions/authActions";
import { getStoreNetEarning } from "@/actions/storeActions";
import { format, subDays, formatDistance } from "date-fns";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 bg-[#004CFF] rounded-full"></div>
          <p className="text-sm text-gray-600">Orders: {payload[0].value}</p>
        </div>
      </div>
    );
  }
  return null;
};

// Helper function to get the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "text-yellow-600 bg-yellow-50";
    case OrderStatus.CONFIRMED:
      return "text-blue-600 bg-blue-50";
    case OrderStatus.PRINTED:
      return "text-purple-600 bg-purple-50";
    case OrderStatus.FULFILLED:
      return "text-green-600 bg-green-50";
    case OrderStatus.PAID:
      return "text-green-600 bg-green-50";
    case OrderStatus.CANCELED:
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

// Helper function to get the progress percentage
const getProgressPercentage = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "2%";
    case OrderStatus.CONFIRMED:
      return "34%";
    case OrderStatus.PRINTED:
      return "66%";
    case OrderStatus.PAID:
      return "100%";
    case OrderStatus.FULFILLED:
      return "80%";
    case OrderStatus.CANCELED:
      return "0%";
    default:
      return "0%";
  }
};

enum OrderStatus {
  CANCELED = "CANCELED",
  CONFIRMED = "CONFIRMED",
  PRINTED = "PRINTED",
  FULFILLED = "FULFILLED",
  PAID = "PAID",
  PENDING = "PENDING",
}
export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("All Orders");
  const [netEarnings, setNetEarnings] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Statistics state
  const [todayRevenue, setTodayRevenue] = useState("0.00 TND");
  const [weekRevenue, setWeekRevenue] = useState("0.00 TND");
  const [monthRevenue, setMonthRevenue] = useState("0.00 TND");
  const [totalRevenue, setTotalRevenue] = useState("0.00 TND");
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Get the store ID for the current user
        const userStoreId = await getUserStoreId();
        if (userStoreId) {
          setStoreId(userStoreId);

          // Fetch store details
          const store = await getStoreById(userStoreId);
          setStoreData(store);

          // Fetch store earnings
          const earnings = await getStoreNetEarning(userStoreId);
          if (earnings && earnings.success) {
            setNetEarnings(earnings.data);
            setTotalRevenue(formatCurrency(earnings.data?.netEarnings || 0));
          }

          // Fetch orders for this store
          const storeOrders = await getOrdersByStoreId(userStoreId);
          setOrders(storeOrders);
          setFilteredOrders(storeOrders);

          // Calculate order statistics
          calculateOrderStatistics(storeOrders);

          // Generate chart data from orders
          generateChartData(storeOrders);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // helper function to calculate net revenue for any set of orders
  const calculateNetRevenue = (orders: any[]) => {
    if (!orders || orders.length === 0) return 0;

    // Filter fulfilled orders (only count completed orders for revenue)
    const fulfilledOrders = orders.filter(
      (order) =>
        order.status === OrderStatus.FULFILLED ||
        order.status === OrderStatus.PAID
    );

    // Calculate delivered total
    const deliveredTotal = fulfilledOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Calculate total delivery fees
    const totalDeliveryFees = fulfilledOrders.reduce((sum, order) => {
      return sum + (order.shippingMethod === "EXPRESS" ? 7 : 5);
    }, 0);

    // Calculate total MonkeyPrint earnings (10% of each order's value after shipping fees)
    const totalMonkeyPrintEarnings = fulfilledOrders.reduce((sum, order) => {
      const deliveryFee = order.shippingMethod === "EXPRESS" ? 7 : 5;
      const totalAfterFees = order.totalPrice - deliveryFee;
      return sum + totalAfterFees * 0.1;
    }, 0);

    // Calculate total return fees (5 per canceled order)
    const canceledOrders = orders.filter(
      (order) => order.status === OrderStatus.CANCELED
    );
    const totalReturnFees = canceledOrders.length * 5;

    // Calculate net earnings
    const netEarnings =
      deliveredTotal -
      totalDeliveryFees -
      totalReturnFees -
      totalMonkeyPrintEarnings;

    return netEarnings;
  };

  // Calculate order statistics based on time periods
  const calculateOrderStatistics = (orders: any[]) => {
    if (!orders || !orders.length) return;

    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const weekStart = subDays(new Date(), 7);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Filter orders by time periods
    const todayOrdersList = orders.filter(
      (order) => new Date(order.createdAt) >= todayStart
    );

    const weekOrdersList = orders.filter(
      (order) => new Date(order.createdAt) >= weekStart
    );

    const monthOrdersList = orders.filter(
      (order) => new Date(order.createdAt) >= monthStart
    );

    // Calculate net revenue for each period
    const todayNetRevenue = calculateNetRevenue(todayOrdersList);
    const weekNetRevenue = calculateNetRevenue(weekOrdersList);
    const monthNetRevenue = calculateNetRevenue(monthOrdersList);

    // Update state
    setTodayRevenue(formatCurrency(todayNetRevenue));
    setWeekRevenue(formatCurrency(weekNetRevenue));
    setMonthRevenue(formatCurrency(monthNetRevenue));
    setTotalOrdersCount(orders.length);
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} TND`;
  };

  // Generate chart data from orders
  const generateChartData = (orders: any[]) => {
    if (!orders || !orders.length) return;

    // Create an array of the last 10 days
    const last10Days = Array.from({ length: 10 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, "MMM dd"),
        fullDate: date,
        orders: 0,
      };
    }).reverse();

    // Count orders for each day
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const dayIndex = last10Days.findIndex(
        (day) =>
          orderDate.getDate() === day.fullDate.getDate() &&
          orderDate.getMonth() === day.fullDate.getMonth() &&
          orderDate.getFullYear() === day.fullDate.getFullYear()
      );

      if (dayIndex !== -1) {
        last10Days[dayIndex].orders += 1;
      }

      // Calculate the total orders for the last 10 days
      const last10DaysTotal = last10Days.reduce(
        (sum, day) => sum + day.orders,
        0
      );

      // Update the total orders count to show only last 10 days
      setTotalOrdersCount(last10DaysTotal);

      // Remove the fullDate property before setting chart data
      setChartData(last10Days.map(({ date, orders }) => ({ date, orders })));
    });

    // Remove the fullDate property before setting chart data
    setChartData(last10Days.map(({ date, orders }) => ({ date, orders })));
  };

  // Filter orders when status filter changes
  useEffect(() => {
    if (!orders.length) return;

    if (statusFilter === "All Orders") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => order.status === statusFilter);
      setFilteredOrders(filtered);
    }
  }, [statusFilter, orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-[#004CFF] mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 relative">
      <div className="mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white h-[15vh] flex flex-col justify-center">
            <div className="px-4">
              <div className="text-xs font-semibold text-gray-600 mb-6">
                Orders Today
              </div>
              <div className="text-l font-bold text-gray-900">
                {todayRevenue}
              </div>
            </div>
          </Card>

          <Card className="bg-white h-[15vh] flex flex-col justify-center">
            <div className="px-4">
              <div className="text-xs font-semibold text-gray-600 mb-6">
                Orders This Week
              </div>
              <div className="text-l font-bold text-gray-900">{weekRevenue}</div>
            </div>
          </Card>

          <Card className="bg-white h-[15vh] flex flex-col justify-center">
            <div className="px-4">
              <div className="text-xs font-semibold text-gray-600 mb-6">
                Orders This Month
              </div>
              <div className="text-l font-bold text-gray-900">
                {monthRevenue}
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden h-[15vh] flex flex-col justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#004CFF] to-[#0066FF]">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>
            <div className="px-4 relative z-10">
              <div className="text-xs font-semibold text-white mb-6">
                Total Revenue
              </div>
              <div className="text-l font-bold text-white">{totalRevenue}</div>
            </div>
          </Card>
        </div>

        {/* Order Tracking Section */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Order Tracking
                </CardTitle>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Orders</option>
                <option>{OrderStatus.PENDING}</option>
                <option>{OrderStatus.CONFIRMED}</option>
                <option>{OrderStatus.PRINTED}</option>
                <option>{OrderStatus.PAID}</option>
                <option>{OrderStatus.FULFILLED}</option>
                <option>{OrderStatus.CANCELED}</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders found for the selected filter.
                </div>
              ) : (
                // Display at most 3 orders
                filteredOrders.slice(0, 3).map((order, index) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-[#004CFF] font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Order #{order.id.substring(0, 6).toUpperCase()}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Placed{" "}
                              {formatDistance(
                                new Date(order.createdAt),
                                new Date(),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-sm font-medium ${getStatusColor(order.status)} px-2.5 py-0.5 rounded-full`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Est.{" "}
                          {format(
                            new Date(
                              new Date(order.createdAt).getTime() +
                                5 * 24 * 60 * 60 * 1000
                            ),
                            "MMM dd"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 mb-2">
                      <div className="relative">
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#004CFF] h-full rounded-full"
                            style={{
                              width: getProgressPercentage(order.status),
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                order.status !== OrderStatus.CANCELED
                                  ? "bg-[#004CFF]"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <span
                              className={`text-xs ${
                                order.status !== OrderStatus.CANCELED
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              } mt-1`}
                            >
                              Order
                              <br />
                              Placed
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                [
                                  OrderStatus.CONFIRMED,
                                  OrderStatus.PRINTED,
                                  OrderStatus.PAID,
                                  OrderStatus.FULFILLED,
                                ].includes(order.status)
                                  ? "bg-[#004CFF]"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <span
                              className={`text-xs ${
                                [
                                  OrderStatus.CONFIRMED,
                                  OrderStatus.PRINTED,
                                  OrderStatus.PAID,
                                  OrderStatus.FULFILLED,
                                ].includes(order.status)
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              } mt-1`}
                            >
                              Confirmed
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                [
                                  OrderStatus.PRINTED,
                                  OrderStatus.PAID,
                                  OrderStatus.FULFILLED,
                                ].includes(order.status)
                                  ? "bg-[#004CFF]"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <span
                              className={`text-xs ${
                                [
                                  OrderStatus.PRINTED,
                                  OrderStatus.PAID,
                                  OrderStatus.FULFILLED,
                                ].includes(order.status)
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              } mt-1`}
                            >
                              Printed
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                [OrderStatus.FULFILLED].includes(order.status)
                                  ? "bg-[#004CFF]"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <span
                              className={`text-xs ${
                                [OrderStatus.FULFILLED].includes(order.status)
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              } mt-1`}
                            >
                              Delivered
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Map Preview - Only show for SHIPPING status */}
                    {(order.status === OrderStatus.PRINTED ||
                      order.status === OrderStatus.PAID) && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-700"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">
                            Package in transit
                          </div>
                          <div className="text-xs text-blue-700">
                            Last seen in Tunis at {format(new Date(), "h:mm a")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* View All Button */}
              <Button
                className="w-full bg-[#004CFF] hover:bg-[#0040CC] text-white"
                onClick={() => router.push(`/admin/ordersState?id=${storeId}`)}
              >
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 ">
          {/* Orders Chart */}
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Orders
                  </CardTitle>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm text-[#004CFF]">
                  {totalOrdersCount} Orders
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(value) => value.split(" ")[1]}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      domain={[0, "auto"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="orders"
                      fill="#004CFF"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Number of orders over the last 10 days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
