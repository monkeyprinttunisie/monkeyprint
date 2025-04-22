"use server";

import { db, Prisma } from "@monkeyprint/db";
import { CartItem, ContactInfo, OrderResponse, Order } from "@/types";
import { revalidatePath } from "next/cache";
import { ShippingMethod, OrderStatus } from "@monkeyprint/db";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true; contactInfo: true };
}>;

// Helper function to convert Prisma order to your Order type
function convertPrismaOrderToOrder(prismaOrder: any): Order {
  return {
    id: prismaOrder.id,
    userId: prismaOrder.userId,
    status: prismaOrder.status,
    totalPrice: prismaOrder.totalPrice,
    shippingMethod: prismaOrder.shippingMethod,
    shippingFee: prismaOrder.shippingFee,
    items: prismaOrder.items,
    contactInfo: prismaOrder.contactInfo,
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
  };
}

export async function createOrder(
  cartItems: CartItem[],
  contactInfo: ContactInfo,
  shippingMethod: ShippingMethod
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

export async function getOrders(): Promise<OrderResponse> {
  try {
    const orders = await db.order.findMany({
      where: { isDeleted: false },
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

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderResponse> {
  try {
    const prismaOrder = await db.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        contactInfo: true,
      },
    });

    revalidatePath("/orders");
    revalidatePath(`/admin/orders/${id}`);

    return { success: true, order: convertPrismaOrderToOrder(prismaOrder) };
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

export async function getOredersByStoreId(
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
