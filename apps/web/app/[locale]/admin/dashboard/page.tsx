"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const emptyChartData = [
  { date: "May 15", orders: 0 },
  { date: "May 16", orders: 0 },
  { date: "May 17", orders: 0 },
  { date: "May 18", orders: 0 },
  { date: "May 19", orders: 0 },
  { date: "May 20", orders: 0 },
  { date: "May 21", orders: 0 },
  { date: "May 22", orders: 0 },
  { date: "May 23", orders: 0 },
  { date: "May 24", orders: 0 },
];

const sampleChartData = [
  { date: "May 15", orders: 2 },
  { date: "May 16", orders: 1 },
  { date: "May 17", orders: 4 },
  { date: "May 18", orders: 3 },
  { date: "May 19", orders: 6 },
  { date: "May 20", orders: 2 },
  { date: "May 21", orders: 5 },
  { date: "May 22", orders: 1 },
  { date: "May 23", orders: 3 },
  { date: "May 24", orders: 4 },
];

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

export default function Page() {
  const [withData, setWithData] = useState(false);

  const chartData = withData ? sampleChartData : emptyChartData;
  const totalOrders = withData
    ? sampleChartData.reduce((sum, item) => sum + item.orders, 0)
    : 0;
  const todayOrders = withData ? "12.50 TND" : "0.00 TND";
  const weekOrders = withData ? "45.20 TND" : "0.00 TND";
  const monthOrders = withData ? "156.80 TND" : "0.00 TND";
  const totalRevenue = withData ? "1,250.00 TND" : "0.00 TND";

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 relative">
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setWithData(!withData)}
          className="bg-[#004CFF] hover:bg-[#0040CC] text-white"
        >
          {withData ? "Show Empty Version" : "Show With Data"}
        </Button>
      </div>

      <div className="mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white h-[15vh] flex flex-col justify-center">
            <div className="px-4">
              <div className="text-xs font-semibold text-gray-600 mb-6">
                Orders Today
              </div>
              <div className="text-l font-bold text-gray-900">
                {todayOrders}
              </div>
            </div>
          </Card>

          <Card className="bg-white h-[15vh] flex flex-col justify-center">
            <div className="px-4">
              <div className="text-xs font-semibold text-gray-600 mb-6">
                Orders This Week
              </div>
              <div className="text-l font-bold text-gray-900">{weekOrders}</div>
            </div>
          </Card>

          <Card className="bg-white h-[15vh] flex flex-col justify-center">
            <div className="px-4">
              <div className="text-xs font-semibold text-gray-600 mb-6">
                Orders This Month
              </div>
              <div className="text-l font-bold text-gray-900">
                {monthOrders}
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
              {withData && (
                <select className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                  <option>All Orders</option>
                  <option>In Progress</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!withData ? (
              <Button
                className="w-full bg-blue-100 text-[#004CFF] hover:bg-blue-200 rounded-full py-3"
                variant="secondary"
              >
                No data available
              </Button>
            ) : (
              <div className="space-y-5">
                {/* Order 1 - In Progress */}
                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-[#004CFF] font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Order #MP-3291
                          </h3>
                          <p className="text-xs text-gray-500">
                            Placed 2 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded-full">
                        In Progress
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Est. May 27
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 mb-2">
                    <div className="relative">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#004CFF] h-full rounded-full"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-[#004CFF]"></div>
                          <span className="text-xs text-gray-500 mt-1">
                            Order
                            <br />
                            Placed
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-[#004CFF]"></div>
                          <span className="text-xs text-gray-500 mt-1">
                            Processing
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                          <span className="text-xs text-gray-400 mt-1">
                            Shipped
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                          <span className="text-xs text-gray-400 mt-1">
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order 2 - Shipped */}
                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-[#004CFF] font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Order #MP-3285
                          </h3>
                          <p className="text-xs text-gray-500">
                            Placed 1 day ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        Shipped
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Est. May 25
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 mb-2">
                    <div className="relative">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#004CFF] h-full rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-[#004CFF]"></div>
                          <span className="text-xs text-gray-500 mt-1">
                            Order
                            <br />
                            Placed
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-[#004CFF]"></div>
                          <span className="text-xs text-gray-500 mt-1">
                            Processing
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-[#004CFF]"></div>
                          <span className="text-xs text-gray-500 mt-1">
                            Shipped
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                          <span className="text-xs text-gray-400 mt-1">
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Preview */}
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
                        Last seen in Tunis at 10:45 AM
                      </div>
                    </div>
                  </div>
                </div>

                {/* View All Button */}
                <Button className="w-full bg-[#004CFF] hover:bg-[#0040CC] text-white">
                  View All Orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                  {totalOrders} Orders
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
                      domain={[0, 6]}
                      ticks={[0, 1, 2, 3, 4, 5, 6]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="orders"
                      fill={withData ? "#004CFF" : "#E5E7EB"}
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

          {/* Traffic Chart */}
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Order Traffic
                  </CardTitle>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                {withData && (
                  <select className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!withData ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-8 w-8 text-[#004CFF] mb-2" />
                    <p className="text-sm text-gray-500">No data available</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Traffic Sources Visualization */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-blue-900">
                          Top Sources
                        </h3>
                        <span className="text-xs text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                          +12.4%
                        </span>
                      </div>

                      {/* Traffic Sources Bars */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Direct</span>
                            <span className="font-medium text-gray-800">
                              42%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div
                              className="bg-[#004CFF] h-full rounded-full"
                              style={{ width: "42%" }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Social Media</span>
                            <span className="font-medium text-gray-800">
                              25%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div
                              className="bg-[#4B7BE5] h-full rounded-full"
                              style={{ width: "25%" }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Search</span>
                            <span className="font-medium text-gray-800">
                              20%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div
                              className="bg-[#6D92E5] h-full rounded-full"
                              style={{ width: "20%" }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Referral</span>
                            <span className="font-medium text-gray-800">
                              13%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div
                              className="bg-[#9DB7FF] h-full rounded-full"
                              style={{ width: "13%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-blue-900">
                          Devices
                        </h3>
                        <span className="text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                          +8.7%
                        </span>
                      </div>

                      {/* Devices Stats */}
                      <div className="flex items-center justify-center h-auto py-2">
                        <div className="flex items-end justify-center space-x-4 md:space-x-6">
                          <div className="flex flex-col items-center">
                            <div className="h-16 sm:h-20 md:h-24 w-6 sm:w-8 bg-[#004CFF] rounded-t-lg"></div>
                            <p className="mt-2 text-xs text-gray-600">Mobile</p>
                            <p className="text-xs font-medium text-gray-800">
                              62%
                            </p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="h-8 sm:h-10 md:h-12 w-6 sm:w-8 bg-[#4B7BE5] rounded-t-lg"></div>
                            <p className="mt-2 text-xs text-gray-600">Tablet</p>
                            <p className="text-xs font-medium text-gray-800">
                              18%
                            </p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="h-10 sm:h-14 md:h-16 w-6 sm:w-8 bg-[#9DB7FF] rounded-t-lg"></div>
                            <p className="mt-2 text-xs text-gray-600">
                              Desktop
                            </p>
                            <p className="text-xs font-medium text-gray-800">
                              20%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Stats */}
                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Conversion Highlights
                      </h3>
                      <div className="text-xs text-gray-500">Last 7 days</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#004CFF]">
                          3.2%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Conversion Rate
                        </div>
                        <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                              clipRule="evenodd"
                            />
                          </svg>
                          0.8%
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-[#004CFF]">
                          72%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Cart Completion
                        </div>
                        <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                              clipRule="evenodd"
                            />
                          </svg>
                          5.3%
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-[#004CFF]">
                          2:15
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Avg. Session (min)
                        </div>
                        <div className="text-xs text-red-600 flex items-center justify-center mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                              clipRule="evenodd"
                            />
                          </svg>
                          0.3%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-[#004CFF] hover:bg-[#0040CC] text-white">
                    View Traffic Analytics
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
