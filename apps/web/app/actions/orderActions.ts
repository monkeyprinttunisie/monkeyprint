"use server";

import { db } from "@monkeyprint/db";
import {
  CartItem,
  ShippingAddress,
  ContactInfo,
  OrderResponse,
  Order,
} from "@/types";
import { revalidatePath } from "next/cache";
import { ShippingMethod, OrderStatus } from "@monkeyprint/db";

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
    shippingAddress: prismaOrder.shippingAddress,
    contactInfo: prismaOrder.contactInfo,
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
  };
}

export async function createOrder(
  cartItems: CartItem[],
  shippingAddress: ShippingAddress,
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
      shippingAddress: {
        create: {
          country: shippingAddress.country,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
        },
      },
      contactInfo: {
        create: {
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          phone: contactInfo.phone,
          email: contactInfo.email || null,
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

    // Create order with the clean data object
    const prismaOrder = await db.order.create({
      data: orderData,
      include: {
        items: true,
        shippingAddress: true,
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
    return { success: false, error: "Failed to create order" };
  }
}

export async function getOrders(): Promise<OrderResponse> {
  try {
    const prismaOrders = await db.order.findMany({
      where: { isDeleted: false },
      include: {
        items: true,
        shippingAddress: true,
        contactInfo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const orders = prismaOrders.map((order) =>
      convertPrismaOrderToOrder(order)
    );

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
        shippingAddress: true,
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
        shippingAddress: true,
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
