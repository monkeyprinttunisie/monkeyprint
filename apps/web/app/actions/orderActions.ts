"use server";

import { db, Prisma } from "@monkeyprint/db";
import { CartItem, ContactInfo, OrderResponse, Order } from "@/types";
import { revalidatePath } from "next/cache";
import { ShippingMethod, OrderStatus } from "@monkeyprint/db";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true; contactInfo: true };
}>;

// convert Prisma order to your Order type
function convertPrismaOrderToOrder(prismaOrder: any): Order {
  return {
    id: prismaOrder.id,
    userId: prismaOrder.userId,
    status: prismaOrder.status,
    totalPrice: prismaOrder.totalPrice,
    shippingMethod: prismaOrder.shippingMethod,
    shippingFee: prismaOrder.shippingFee,
    items: prismaOrder.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.imageUrl,
      stock: 0,
    })),
    contactInfo: prismaOrder.contactInfo
      ? {
          id: prismaOrder.contactInfo.id,
          name: prismaOrder.contactInfo.name,
          orderId: prismaOrder.contactInfo.orderId,
          email: prismaOrder.contactInfo.email,
          phone: prismaOrder.contactInfo.phone,
          country: prismaOrder.contactInfo.country,
          address: prismaOrder.contactInfo.address,
          city: prismaOrder.contactInfo.city,
        }
      : null,
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
    storeId: prismaOrder.storeId || null,
    isDeleted: prismaOrder.isDeleted || false,
  };
}

export async function createOrder(
  cartItems: CartItem[],
  contactInfo: ContactInfo,
  shippingMethod: ShippingMethod,
  storeId?: string
): Promise<OrderResponse> {
  try {
    const shippingFee = shippingMethod === "STANDARD" ? 5 : 7;

    // Calculate subtotal from cart items
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calculate total with shipping
    const totalPrice = subtotal + shippingFee;

    // Create the order with carefully structured data
    const orderData = {
      totalPrice,
      shippingMethod,
      shippingFee,
      storeId,
      status: OrderStatus.PENDING,
      contactInfo: {
        create: {
          name: contactInfo.name,
          phone: contactInfo.phone,
          email: contactInfo.email || null,
          country: "Tunisia",
          address: contactInfo.address,
          city: contactInfo.city,
        },
      },
      items: {
        create: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          imageUrl: item.imageUrl,
        })),
      },
    };

    console.log("Order data being sent:", JSON.stringify(orderData, null, 2));

    // Create order with the clean data object
    const prismaOrder = await db.order.create({
      data: orderData,
      include: {
        items: true,
        contactInfo: true,
      },
    });

    // Update product stock
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    revalidatePath("/orders");

    return { success: true, order: convertPrismaOrderToOrder(prismaOrder) };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

export async function getOrders(storeId?: string): Promise<OrderResponse> {
  try {
    // Build the query with dynamic filtering
    const whereClause: any = {
      isDeleted: false,
    };

    // Add storeId filter only when provided
    if (storeId) {
      whereClause.storeId = storeId;
    }

    const orders = await db.order.findMany({
      where: whereClause,
      // Keep both relations included
      include: {
        items: true,
        contactInfo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function getOrderById(id: string): Promise<OrderResponse> {
  try {
    const prismaOrder = await db.order.findUnique({
      where: { id, isDeleted: false },
      include: {
        items: true,
        contactInfo: true,
      },
    });

    if (!prismaOrder) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order: convertPrismaOrderToOrder(prismaOrder) };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

export async function getOrdersByPhoneNumber(
  phoneNumber: string,
  storeId?: string
) {
  try {
    // Find the contact info with this phone number
    const contactInfos = await db.contactInfo.findMany({
      where: {
        phone: phoneNumber,
      },
      select: {
        orderId: true,
      },
    });

    if (contactInfos.length === 0) {
      return {
        success: false,
        error: "No orders found with this phone number",
      };
    }

    // Get all orders by these order IDs
    const orderIds = contactInfos.map((info) => info.orderId);

    const orders = await db.order.findMany({
      where: {
        id: { in: orderIds },
        isDeleted: false,
        storeId: storeId,
      },
      include: {
        items: true,
        contactInfo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      orders: orders.map((order) => convertPrismaOrderToOrder(order)),
    };
  } catch (error) {
    const errorMessage = storeId
      ? "Error fetching orders by phone number and store ID:"
      : "Error fetching orders by phone number:";

    console.error(errorMessage, error);
    return { success: false, error: errorMessage };
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderResponse> {
  try {
    const order = await db.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        contactInfo: true,
      },
    });

    revalidatePath("/orders");
    revalidatePath(`/admin/orders/${id}`);

    return { success: true, order };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function deleteOrder(id: string): Promise<OrderResponse> {
  try {
    await db.order.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath("/orders");

    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}

export async function getOrdersByStoreId(
  storeId: string
): Promise<OrderWithItems[]> {
  const orders = await db.order.findMany({
    where: { storeId: storeId },
    include: {
      items: true,
      contactInfo: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}
