"use server";

import { db } from "@monkeyprint/db";

export async function getWalletData(storeId: string, date?: string) {
  try {
    // Parse the date parameter if it exists
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (date) {
      // Create date from the parameter (assumes YYYY-MM-DD format)
      startDate = new Date(date);
      endDate = new Date(date);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Set to start and end of the day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        return { success: false, error: "Invalid date format" };
      }
    }

    // Check if the store exists
    const store = await db.store.findUnique({
      where: {
        id: storeId,
        isDeleted: false,
      },
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    // Build query for orders
    const orderQuery: any = {
      storeId: storeId,
      isDeleted: false,
    };

    // Add date filter if dates are provided
    if (startDate && endDate) {
      orderQuery.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Calculate totals from orders for this store
    const orders = await db.order.findMany({
      where: orderQuery,
      select: {
        totalPrice: true,
        status: true,
        id: true,
      },
    });

    // Calculate totals based on order status
    const deliveredTotal = orders
      .filter((o) => o.status === "FULFILLED")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Calculate product counts for delivered and returned orders
    const deliveredProductCount = orders.filter(
      (o) => o.status === "FULFILLED"
    ).length;
    const returnedProductCount = orders.filter(
      (o) => o.status === "CANCELED"
    ).length;

    const returnedTotal = returnedProductCount * 5;

    // Get order counts by status
    const deliveredCount = orders.filter(
      (o) => o.status === "FULFILLED"
    ).length;
    const shippingCount = orders.filter((o) => o.status === "CONFIRMED").length;
    const returnedCount = orders.filter((o) => o.status === "CANCELED").length;

    // Calculate the total (delivered minus returned)
    const totalAmount =
      deliveredTotal - 7 * deliveredProductCount - returnedTotal;

    // Return the calculated values
    return {
      success: true,
      data: {
        total: totalAmount,
        delivered: deliveredTotal,
        returned: returnedTotal,
        deliveredProductCount,
        returnedProductCount,
        currency: "DT",
        orderCounts: {
          delivered: deliveredCount,
          shipping: shippingCount,
          returned: returnedCount,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return { success: false, error: "Failed to fetch wallet data" };
  }
}
