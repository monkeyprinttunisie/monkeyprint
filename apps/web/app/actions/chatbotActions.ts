"use server";

import { CartItem, ContactInfo, Product } from "@/types";
import { ShippingMethod, Order } from "@monkeyprint/db";
import { cookies } from "next/headers";

import {
  createOrder as createOrderAction,
  getOrderById,
} from "@/actions/orderActions";
import { listCategories } from "@/actions/categoryActions";
import {
  getProductsByCategory as getProductsByCategoryAction,
  getProductById as getProductByIdAction,
} from "@/actions/productActions";

import {
  getOrdersByPhoneNumber,
  updateOrderStatus,
} from "@/actions/orderActions";
import { sendOrderIssueEmail } from "@monkeyprint/utils/email";

import { UTApi } from "uploadthing/server";

import { OrderForEmail } from "@monkeyprint/utils/email";
// Initialize Resend for email
const utapi = new UTApi();

interface DatabaseOrder {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: Date | string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}
// Define conversation states
type ConversationState = {
  stage:
    | "GREETING"
    | "CATEGORY_SELECTION"
    | "PRODUCT_SELECTION"
    | "QUANTITY_SELECTION"
    | "CONTINUE_OR_COMPLETE"
    | "CONTACT_INFO"
    | "SHIPPING_METHOD"
    | "CONFIRMATION"
    | "PHONE_VERIFICATION"
    | "ORDER_SELECTION"
    | "ISSUE_TYPE_SELECTION"
    | "ISSUE_DESCRIPTION"
    | "ISSUE_CONFIRMATION"
    | "UPLOAD_PHOTO";
  selectedCategory?: string;
  selectedProduct?: Product;
  temporaryCart: CartItem[];
  contactInfo?: ContactInfo;
  shippingMethod?: ShippingMethod;
  phoneNumber?: string;
  selectedOrder?: Order;
  issueType?: string;
  issueDescription?: string;
  uploadedImageUrl?: string;
};

export async function resetChatbotState() {
  const cookieStore = await cookies();
  cookieStore.delete("chatbot_state");
  return { success: true };
}

export async function sendContactInfoToChatbot(contactInfo: ContactInfo) {
  try {
    const state = await getConversationState();

    if (state.stage === "CONTACT_INFO") {
      await updateConversationState({
        ...state,
        stage: "SHIPPING_METHOD",
        contactInfo,
      });

      return {
        success: true,
        message:
          "Thanks for providing your contact details. Please select a shipping method:",
        intent: "SHIPPING_METHOD",
        cart: state.temporaryCart,
        options: [
          {
            id: "STANDARD",
            text: "Standard Shipping (5 DT)",
            type: "shipping",
          },
          {
            id: "EXPRESS",
            text: "Express Shipping (7 DT)",
            type: "shipping",
          },
        ],
      };
    }

    return {
      success: false,
      message:
        "There was an issue processing your contact information. Please try again.",
    };
  } catch (error) {
    console.error("Error processing contact info:", error);
    return {
      success: false,
      message: "Sorry, I encountered an error. Please try again.",
    };
  }
}

export async function sendMessageToChatbot(message: string, optionId?: string) {
  try {
    // Get current conversation state from cookies or initialize
    const state = await getConversationState();

    // Process message based on current stage
    switch (state.stage) {
      case "GREETING":
        // Add handling for "order_issues" option first
        if (
          optionId === "order_issues" ||
          message.toLowerCase().includes("issue") ||
          message.toLowerCase().includes("problem")
        ) {
          await updateConversationState({
            ...state,
            stage: "PHONE_VERIFICATION",
          });

          return {
            success: true,
            message:
              "I'd be happy to help with any order issues. Please provide the phone number you used when placing your order:",
            intent: "PHONE_VERIFICATION",
          };
        }

        // Then handle order creation as you already do
        else if (
          message.toLowerCase().includes("order") ||
          message.toLowerCase().includes("buy")
        ) {
          // Your existing code for order creation flow...
          const categoriesResponse = await listCategories();
          if (!categoriesResponse.success || !categoriesResponse.categories) {
            return {
              success: false,
              message:
                "Sorry, I couldn't retrieve product categories. Please try again later.",
            };
          }
          // Filter only TARGET categories (top-level)
          const targetCategories = categoriesResponse.categories.filter(
            (cat) => cat.type === "TARGET"
          );

          await updateConversationState({
            ...state,
            stage: "CATEGORY_SELECTION",
          });

          return {
            success: true,
            message:
              "Great! Let's start your order. What type of product are you looking for?",
            intent: "CATEGORY_SELECTION",
            options: targetCategories.map((cat) => ({
              id: cat.id,
              text: cat.name,
              type: "category",
            })),
          };
        } else {
          return {
            success: true,
            message:
              "Hello! I'm your MonkeyPrint assistant. How can I help you today? You can ask me about products or place an order.",
            options: [
              {
                id: "start_order",
                text: "Create a new order",
                type: "action",
              },
              {
                id: "order_issues",
                text: "Order Issues",
                type: "action",
              },
            ],
          };
        }

      // Add the new order issue related cases
      case "PHONE_VERIFICATION":
        // Simple regex for phone number validation - can be enhanced as needed
        const phoneRegex = /^\+?\d{8,15}$/;

        if (phoneRegex.test(message.trim())) {
          const phoneNumber = message.trim();
          const ordersResponse = await getOrdersByPhoneNumber(phoneNumber);

          if (!ordersResponse.success || !ordersResponse.orders) {
            return {
              success: false,
              message:
                "I couldn't find any orders with that phone number. Please verify the number and try again, or start a new conversation to place an order.",
            };
          }

          await updateConversationState({
            ...state,
            stage: "ORDER_SELECTION",
            phoneNumber,
          });

          // Format orders for display
          const orderOptions = ordersResponse.orders.map((order) => ({
            id: order.id,
            text: `Order #${order.id.slice(0, 8)} - ${new Date(order.createdAt).toLocaleDateString()} - ${order.status} - ${order.totalPrice.toFixed(2)} DT`,
            type: "order",
            imageUrl: order.items[0]?.imageUrl,
          }));

          return {
            success: true,
            message:
              "Great! Here are your orders. Please select the one you're having an issue with:",
            intent: "ORDER_SELECTION",
            options: orderOptions,
          };
        } else {
          return {
            success: true,
            message:
              "That doesn't look like a valid phone number. Please enter a valid phone number (8-15 digits):",
            intent: "PHONE_VERIFICATION",
          };
        }

      case "ORDER_SELECTION":
        const orderId = optionId || message;

        if (orderId) {
          // Get the order details
          const orderResponse = await getOrderById(orderId);

          if (!orderResponse.success || !orderResponse.order) {
            return {
              success: false,
              message:
                "I couldn't retrieve that order. Please try again or select a different order.",
            };
          }

          await updateConversationState({
            ...state,
            stage: "ISSUE_TYPE_SELECTION",
            selectedOrder: orderResponse.order,
          });

          return {
            success: true,
            message: `I found your order #${orderId.slice(0, 8)}. What issue are you experiencing?`,
            intent: "ISSUE_TYPE_SELECTION",
            options: [
              {
                id: "cancel_order",
                text: "I want to cancel my order",
                type: "action",
              },
              {
                id: "return_order",
                text: "I want to return my order",
                type: "action",
              },
              {
                id: "not_received",
                text: "I didn't receive my order",
                type: "action",
              },
              {
                id: "damaged_order",
                text: "My order was damaged",
                type: "action",
              },
              { id: "other_issue", text: "Other issue", type: "action" },
            ],
          };
        } else {
          // If no valid order ID was provided
          return {
            success: true,
            message:
              "Please select an order from the list or provide a valid order ID:",
            intent: "ORDER_SELECTION",
          };
        }

      case "ISSUE_TYPE_SELECTION":
        const issueType = optionId || extractIssueType(message);

        if (!issueType) {
          return {
            success: true,
            message:
              "I didn't understand which issue you're having. Please select one of the options below:",
            intent: "ISSUE_TYPE_SELECTION",
            options: [
              {
                id: "cancel_order",
                text: "I want to cancel my order",
                type: "action",
              },
              {
                id: "return_order",
                text: "I want to return my order",
                type: "action",
              },
              {
                id: "not_received",
                text: "I didn't receive my order",
                type: "action",
              },
              {
                id: "damaged_order",
                text: "My order was damaged",
                type: "action",
              },
              { id: "other_issue", text: "Other issue", type: "action" },
            ],
          };
        }

        await updateConversationState({
          ...state,
          stage: "ISSUE_DESCRIPTION",
          issueType,
        });

        // Handle different issue types
        switch (issueType) {
          case "cancel_order":
            // For cancellation, we go straight to confirmation if it's still pending
            if (state.selectedOrder?.status === "PENDING") {
              return {
                success: true,
                message:
                  "Your order is still pending and can be canceled. Would you like to proceed with cancellation?",
                intent: "ISSUE_CONFIRMATION",
                options: [
                  {
                    id: "confirm_cancel",
                    text: "Yes, cancel my order",
                    type: "action",
                  },
                  {
                    id: "no_cancel",
                    text: "No, keep my order",
                    type: "action",
                  },
                ],
              };
            } else {
              // Order is past the cancellation stage
              await sendOrderIssueEmail(
                prepareOrderForEmail(state.selectedOrder!),
                "Cancel Request (Post-Processing)",
                `Customer attempted to cancel order #${state.selectedOrder?.id.slice(0, 8)} which is already in ${state.selectedOrder?.status} status.`
              );

              return {
                success: true,
                message: `I'm sorry, but your order is already in the "${state.selectedOrder?.status}" stage and can no longer be automatically canceled. I've forwarded your cancellation request to our team, and someone will contact you soon about your options.`,
                intent: "GREETING",
              };
            }

          case "return_order":
            return {
              success: true,
              message:
                "I'm sorry to hear you want to return your order. Please describe the reason for your return in detail:",
              intent: "ISSUE_DESCRIPTION",
            };

          case "not_received":
            // Check the order status
            const status = state.selectedOrder?.status;
            let statusMessage = "";

            if (status === "PENDING") {
              statusMessage =
                "Your order is still being prepared and will be delivered in approximately 3 days.";
            } else if (
              status === "CONFIRMED" ||
              status === "PRINTED" ||
              status === "FULFILLED"
            ) {
              statusMessage =
                "Your order has been processed and should be delivered within the next 2 days.";
            } else {
              statusMessage = `Your order status is currently "${status}". I've forwarded your order latency alert to our customer service team, and they'll contact you as soon as possible to resolve this matter. Thank you for your patience.`;
            }

            await sendOrderIssueEmail(
              prepareOrderForEmail(state.selectedOrder!),
              "Delivery Inquiry",
              `Customer inquired about delivery status for order #${state.selectedOrder?.id.slice(0, 8)} which is in ${status} status.`
            );

            return {
              success: true,
              message: `${statusMessage} If you still don't receive it after the expected delivery date, please contact us again.`,
              intent: "GREETING",
            };

          case "damaged_order":
            return {
              success: true,
              message:
                "I'm sorry to hear your order was damaged. Could you please take a photo of the damaged item so we can address this issue?",
              intent: "UPLOAD_PHOTO",
              uploadEnabled: true,
            };

          case "other_issue":
            return {
              success: true,
              message:
                "Please describe your issue in detail so we can assist you better:",
              intent: "ISSUE_DESCRIPTION",
            };

          default:
            return {
              success: true,
              message: "Please describe your issue in detail:",
              intent: "ISSUE_DESCRIPTION",
            };
        }

      case "ISSUE_DESCRIPTION":
        const description = message.trim();

        if (!description || description.length < 5) {
          return {
            success: true,
            message:
              "Please provide a more detailed description of your issue so we can help you better:",
            intent: "ISSUE_DESCRIPTION",
          };
        }

        await updateConversationState({
          ...state,
          issueDescription: description,
          stage: "ISSUE_CONFIRMATION",
        });

        // For return requests and other issues, send email immediately
        if (
          state.issueType === "return_order" ||
          state.issueType === "other_issue"
        ) {
          await sendOrderIssueEmail(
            prepareOrderForEmail(state.selectedOrder!),
            state.issueType === "return_order"
              ? "Return Request"
              : "Other Issue",
            description
          );

          return {
            success: true,
            message:
              "Thank you for providing details about your issue. I've forwarded your request to our customer service team, and they'll contact you as soon as possible to resolve this matter.",
            intent: "GREETING",
          };
        }

        // For other types with descriptions, confirm first
        return {
          success: true,
          message:
            "Thank you for explaining your issue. Would you like to submit this now to our customer service team?",
          intent: "ISSUE_CONFIRMATION",
          options: [
            {
              id: "confirm_issue",
              text: "Yes, submit my issue",
              type: "action",
            },
            {
              id: "cancel_issue",
              text: "No, cancel my report",
              type: "action",
            },
          ],
        };

      case "UPLOAD_PHOTO":
        // This will be handled differently, as the photo upload will use UploadThing
        // For now, we'll just check if an image URL was provided in the state

        if (state.uploadedImageUrl) {
          // Send email with the image
          await sendOrderIssueEmail(
            prepareOrderForEmail(state.selectedOrder!),
            "Damaged Product Report",
            "Customer reported damaged product and provided an image.",
            state.uploadedImageUrl
          );

          return {
            success: true,
            message:
              "Thank you for sending the photo. I've forwarded your report to our customer service team, and they'll contact you as soon as possible to resolve this issue.",
            intent: "GREETING",
          };
        }

        // If no image is available yet, remind the user to upload one
        return {
          success: true,
          message:
            "Please upload a photo of the damaged item. You can click the camera icon to take a photo or select one from your device.",
          intent: "UPLOAD_PHOTO",
          uploadEnabled: true,
        };

      case "ISSUE_CONFIRMATION":
        if (
          message.toLowerCase().includes("yes") ||
          message.toLowerCase().includes("confirm") ||
          optionId === "confirm_cancel" ||
          optionId === "confirm_issue"
        ) {
          // Handle cancellation if that was the issue type
          if (state.issueType === "cancel_order") {
            // If order is still pending, update status
            if (state.selectedOrder?.status === "PENDING") {
              await updateOrderStatus(state.selectedOrder.id, "CANCELED");

              // Send notification email about the cancellation
              await sendOrderIssueEmail(
                prepareOrderForEmail(state.selectedOrder!),
                "Order Cancellation (Automated)",
                "Customer canceled their order through the chatbot."
              );

              return {
                success: true,
                message:
                  "Your order has been successfully canceled. You'll receive a confirmation of the cancellation by email shortly.",
                intent: "GREETING",
              };
            }
          }

          // For all other confirmed issues
          await sendOrderIssueEmail(
            prepareOrderForEmail(state.selectedOrder!),
            state.issueType === "other_issue"
              ? "Other Issue"
              : state.issueType!,
            state.issueDescription || "No additional details provided."
          );

          return {
            success: true,
            message:
              "Thank you for submitting your issue. Our customer service team has been notified and will contact you as soon as possible to resolve this matter.",
            intent: "GREETING",
          };
        } else if (
          message.toLowerCase().includes("no") ||
          message.toLowerCase().includes("cancel") ||
          optionId === "no_cancel" ||
          optionId === "cancel_issue"
        ) {
          // User decided not to proceed
          return {
            success: true,
            message:
              "I understand. Your issue report has been canceled. Is there anything else I can help you with today?",
            intent: "GREETING",
            options: [
              { id: "start_order", text: "Create a new order", type: "action" },
              {
                id: "order_issues",
                text: "Report a different issue",
                type: "action",
              },
            ],
          };
        } else {
          // Unclear response
          return {
            success: true,
            message:
              "I didn't understand your response. Please confirm if you want to proceed with submitting your issue:",
            intent: "ISSUE_CONFIRMATION",
            options: [
              {
                id: "confirm_issue",
                text: "Yes, submit my issue",
                type: "action",
              },
              {
                id: "cancel_issue",
                text: "No, cancel my report",
                type: "action",
              },
            ],
          };
        }

      case "CATEGORY_SELECTION":
        // User should have selected a category
        const categoryId = optionId || extractOptionId(message);
        if (categoryId) {
          // Try to get products for this category
          const productsResponse =
            await getProductsByCategoryAction(categoryId);

          if (
            !productsResponse.success ||
            !productsResponse.products ||
            productsResponse.products.length === 0
          ) {
            // If no products found directly in this category, get subcategories
            const categoriesResponse = await listCategories();

            if (categoriesResponse.success && categoriesResponse.categories) {
              // Since we don't have direct parentId access, we need to filter differently
              // Look for categories that might be subcategories of the selected one
              const subcategories = categoriesResponse.categories.filter(
                (cat) => cat.type === "PRODUCT"
              );

              if (subcategories.length > 0) {
                await updateConversationState({
                  ...state,
                  selectedCategory: categoryId,
                  stage: "CATEGORY_SELECTION", // Stay in the same stage but show subcategories
                });

                return {
                  success: true,
                  message: "Please select a product category:",
                  intent: "CATEGORY_SELECTION",
                  options: subcategories.map((cat) => ({
                    id: cat.id,
                    text: cat.name,
                    type: "category",
                  })),
                };
              }
            }

            return {
              success: false,
              message:
                "Sorry, I couldn't find any products in this category. Please try another one.",
            };
          }

          await updateConversationState({
            ...state,
            stage: "PRODUCT_SELECTION",
            selectedCategory: categoryId,
          });

          return {
            success: true,
            message:
              "Here are some products in that category. Which one would you like?",
            intent: "PRODUCT_SELECTION",
            options: productsResponse.products.map((product) => ({
              id: product.id,
              text: product.name,
              type: "product",
              imageUrl: product.imageUrl,
              price: product.price,
            })),
          };
        } else {
          // If we couldn't extract a category ID, show categories again
          const categoriesResponse = await listCategories();
          const targetCategories =
            categoriesResponse.categories?.filter(
              (cat) => cat.type === "TARGET"
            ) || [];

          return {
            success: true,
            message:
              "I didn't understand your selection. Please choose one of these categories:",
            intent: "CATEGORY_SELECTION",
            options: targetCategories.map((cat) => ({
              id: cat.id,
              text: cat.name,
              type: "category",
            })),
          };
        }

      case "PRODUCT_SELECTION":
        // User should have selected a product
        const productId = optionId || extractOptionId(message);
        if (productId) {
          const productResponse = await getProductByIdAction(productId);
          if (!productResponse.success || !productResponse.product) {
            return {
              success: false,
              message:
                "Sorry, I couldn't retrieve details for this product. Please try again.",
            };
          }
          const product = productResponse.product;
          await updateConversationState({
            ...state,
            stage: "QUANTITY_SELECTION",
            selectedProduct: product,
          });

          return {
            success: true,
            message: `How many ${product.name} would you like to order? (Please enter a number)`,
            intent: "QUANTITY_SELECTION",
            // Instead of fixed options, allow free input
          };
        } else {
          // If we couldn't extract a product ID, show products again
          if (!state.selectedCategory) {
            return {
              success: false,
              message:
                "Sorry, I lost track of your category selection. Let's start over.",
              intent: "GREETING",
            };
          }
          const productsResponse = await getProductsByCategoryAction(
            state.selectedCategory
          );

          return {
            success: true,
            message:
              "I didn't understand your selection. Please choose one of these products:",
            intent: "PRODUCT_SELECTION",
            options: (productsResponse.products || []).map((product) => ({
              id: product.id,
              text: product.name,
              type: "product",
              imageUrl: product.imageUrl,
              price: product.price,
            })),
          };
        }

      case "QUANTITY_SELECTION":
        // User should have selected a quantity
        const quantity = parseInt(message.trim());
        if (!isNaN(quantity) && quantity > 0) {
          // Add product to temporary cart
          const updatedCart = [...state.temporaryCart];
          const product = state.selectedProduct;

          if (product) {
            const cartItem: CartItem = {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl || "",
              quantity: quantity,
              stock: product.stock || 10, // Default value
            };

            // Check if product already in cart and update quantity instead
            const existingIndex = updatedCart.findIndex(
              (item) => item.id === product.id
            );
            if (existingIndex >= 0) {
              updatedCart[existingIndex].quantity += quantity;
            } else {
              updatedCart.push(cartItem);
            }

            await updateConversationState({
              ...state,
              stage: "CONTINUE_OR_COMPLETE",
              temporaryCart: updatedCart,
            });

            return {
              success: true,
              message: `Great! I've added ${quantity} x ${product.name} to your cart. Would you like to order more products or proceed to checkout?`,
              intent: "CONTINUE_OR_COMPLETE",
              cart: updatedCart,
              options: [
                { id: "more", text: "Add more products", type: "action" },
                { id: "checkout", text: "Proceed to checkout", type: "action" },
              ],
            };
          }
        }

        // If quantity is invalid, ask again
        return {
          success: true,
          message: "Please enter a valid quantity (a number greater than 0):",
          intent: "QUANTITY_SELECTION",
        };

      case "CONTINUE_OR_COMPLETE":
        if (message.toLowerCase().includes("more") || message === "more") {
          // Go back to category selection
          const categoriesResponse = await listCategories();
          const targetCategories =
            categoriesResponse.categories?.filter(
              (cat) => cat.type === "TARGET"
            ) || [];
          await updateConversationState({
            ...state,
            stage: "CATEGORY_SELECTION",
            selectedCategory: undefined,
            selectedProduct: undefined,
          });

          return {
            success: true,
            message: "What category are you interested in next?",
            intent: "CATEGORY_SELECTION",
            options: targetCategories.map((cat) => ({
              id: cat.id,
              text: cat.name,
              type: "category",
            })),
            cart: state.temporaryCart, // Keep showing current cart
          };
        } else if (
          message.toLowerCase().includes("checkout") ||
          message === "checkout"
        ) {
          // Move to contact information
          await updateConversationState({
            ...state,
            stage: "CONTACT_INFO",
          });

          return {
            success: true,
            message:
              "Great! To proceed, I'll need your contact information. Please provide your full name, email, phone number, and delivery address.",
            intent: "CONTACT_INFO",
            cart: state.temporaryCart,
          };
        } else {
          // Unclear response, ask again
          return {
            success: true,
            message:
              "I didn't understand. Would you like to add more products or proceed to checkout?",
            intent: "CONTINUE_OR_COMPLETE",
            cart: state.temporaryCart,
            options: [
              { id: "more", text: "Add more products", type: "action" },
              { id: "checkout", text: "Proceed to checkout", type: "action" },
            ],
          };
        }

      case "CONTACT_INFO":
        // Extract contact info from message
        const contactInfo = extractContactInfo(message);
        if (contactInfo) {
          await updateConversationState({
            ...state,
            stage: "SHIPPING_METHOD",
            contactInfo,
          });

          return {
            success: true,
            message:
              "Thanks for providing your contact details. Please select a shipping method:",
            intent: "SHIPPING_METHOD",
            cart: state.temporaryCart,
            options: [
              {
                id: "STANDARD",
                text: "Standard Shipping (5 DT)",
                type: "shipping",
              },
              {
                id: "EXPRESS",
                text: "Express Shipping (7 DT)",
                type: "shipping",
              },
            ],
          };
        } else {
          return {
            success: true,
            message:
              "I couldn't process your contact information. Please provide your full name, email, phone number, and delivery address in this format: Name: [your name], Email: [your email], Phone: [your phone], Address: [your address], City: [your city]",
            intent: "CONTACT_INFO",
            cart: state.temporaryCart,
          };
        }

      case "SHIPPING_METHOD":
        // Extract shipping method from message
        const shippingMethod = extractShippingMethod(message);
        if (shippingMethod) {
          await updateConversationState({
            ...state,
            stage: "CONFIRMATION",
            shippingMethod,
          });

          // Calculate total price including shipping
          const subtotal = state.temporaryCart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );
          const shippingCost = shippingMethod === "STANDARD" ? 5 : 7;
          const totalPrice = subtotal + shippingCost;

          return {
            success: true,
            message: `Please review your order:\n\nItems: ${state.temporaryCart.map((item) => `${item.quantity}x ${item.name}`).join(", ")}\nShipping: ${shippingMethod === "STANDARD" ? "Standard (5 DT)" : "Express (7 DT)"}\nTotal: ${totalPrice.toFixed(2)} DT\n\nWould you like to place this order?`,
            intent: "CONFIRMATION",
            cart: state.temporaryCart,
            options: [
              { id: "confirm", text: "Confirm Order", type: "action" },
              { id: "cancel", text: "Cancel", type: "action" },
            ],
          };
        } else {
          return {
            success: true,
            message: "Please select a valid shipping method:",
            intent: "SHIPPING_METHOD",
            cart: state.temporaryCart,
            options: [
              {
                id: "STANDARD",
                text: "Standard Shipping (5 DT)",
                type: "shipping",
              },
              {
                id: "EXPRESS",
                text: "Express Shipping (7 DT)",
                type: "shipping",
              },
            ],
          };
        }

      case "CONFIRMATION":
        if (
          message.toLowerCase().includes("confirm") ||
          message === "confirm"
        ) {
          // Create the order
          if (state.contactInfo && state.shippingMethod) {
            const contactInfoWithCity = {
              ...state.contactInfo,
              city: state.contactInfo.city || "Tunis", // Default to Tunis if no city provided
            };

            const orderResponse = await createOrderAction(
              state.temporaryCart,
              contactInfoWithCity,
              state.shippingMethod
            );

            if (orderResponse.success && orderResponse.order) {
              // Reset conversation state
              await resetConversationState();

              return {
                success: true,
                message: `Thank you! Your order has been placed successfully. Creation Date ${orderResponse.order.createdAt}.`,
                intent: "ORDER_CREATED",
                order: orderResponse.order,
              };
            } else {
              return {
                success: false,
                message: `There was an issue creating your order: ${orderResponse.error || "Unknown error"}`,
                intent: "ORDER_FAILED",
                cart: state.temporaryCart,
              };
            }
          } else {
            // Missing contact info or shipping method
            return {
              success: false,
              message:
                "Missing contact information or shipping method. Please try again.",
              intent: "ORDER_FAILED",
              cart: state.temporaryCart,
            };
          }
        } else if (
          message.toLowerCase().includes("cancel") ||
          message === "cancel"
        ) {
          // Reset conversation
          await resetConversationState();

          return {
            success: true,
            message:
              "Your order has been canceled. Is there anything else I can help you with?",
            intent: "GREETING",
          };
        } else {
          return {
            success: true,
            message: "Please confirm or cancel your order:",
            intent: "CONFIRMATION",
            cart: state.temporaryCart,
            options: [
              { id: "confirm", text: "Confirm Order", type: "action" },
              { id: "cancel", text: "Cancel", type: "action" },
            ],
          };
        }
    }

    // Default response if all else fails
    return {
      success: true,
      message:
        "I'm not sure I understand. You can ask me about products or place an order.",
    };
  } catch (error) {
    console.error("Error processing message:", error);
    return {
      success: false,
      message: "Sorry, I encountered an error. Please try again.",
    };
  }
}

// Helper functions
async function getConversationState(): Promise<ConversationState> {
  const cookieStore = await cookies();
  const state = cookieStore.get("chatbot_state")?.value;
  return state
    ? JSON.parse(state)
    : {
        stage: "GREETING",
        temporaryCart: [],
      };
}

function prepareOrderForEmail(order: DatabaseOrder): OrderForEmail {
  return {
    id: order.id,
    status: order.status,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    items: order.items || [],
    contactInfo: order.contactInfo,
  };
}

function extractIssueType(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cancel")) {
    return "cancel_order";
  } else if (lowerMessage.includes("return")) {
    return "return_order";
  } else if (
    lowerMessage.includes("receiv") ||
    lowerMessage.includes("delivery")
  ) {
    return "not_received";
  } else if (lowerMessage.includes("damag")) {
    return "damaged_order";
  } else if (
    lowerMessage.includes("other") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("problem")
  ) {
    return "other_issue";
  }

  return null;
}

export async function uploadImageForIssue(imageUrl: string) {
  try {
    console.log("Processing image URL:", imageUrl);
    const state = await getConversationState();

    if (!state.selectedOrder) {
      return { success: false, message: "No order selected" };
    }

    // Make sure URL is absolute
    let fullImageUrl = imageUrl;
    if (!imageUrl.startsWith("http")) {
      fullImageUrl = `https://${imageUrl}`;
    }

    // Verify image URL is valid
    console.log("Using image URL in email:", fullImageUrl);

    // Update conversation state
    await updateConversationState({
      ...state,
      uploadedImageUrl: fullImageUrl,
    });

    // Send email with the image
    await sendOrderIssueEmail(
      prepareOrderForEmail(state.selectedOrder),
      "Damaged Product Report",
      "Customer reported damaged product and provided an image.",
      fullImageUrl // Use the absolute URL
    );

    return {
      success: true,
      message:
        "Thank you for sending the photo. I've forwarded your report to our customer service team, and they'll contact you as soon as possible to resolve this issue.",
      imageUrl: fullImageUrl,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    return { success: false, message: "Error processing image" };
  }
}

async function updateConversationState(state: ConversationState) {
  try {
    // Create a safe-to-serialize version of the state
    const safeState = {
      ...state,
      selectedProduct: state.selectedProduct
        ? {
            id: state.selectedProduct.id,
            name: state.selectedProduct.name,
            price: state.selectedProduct.price,
            imageUrl: state.selectedProduct.imageUrl || "",
            stock: state.selectedProduct.stock || 0,
          }
        : undefined,
    };

    const cookieStore = await cookies();
    cookieStore.set("chatbot_state", JSON.stringify(safeState), {
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
  } catch (error) {
    console.error("Error updating conversation state:", error);
    // If the state is too large, try to save a minimal version
    const minimalState = {
      stage: state.stage,
      selectedCategory: state.selectedCategory,
      temporaryCart: state.temporaryCart,
      contactInfo: state.contactInfo,
      shippingMethod: state.shippingMethod,
    };
    const cookieStore = await cookies();
    cookieStore.set("chatbot_state", JSON.stringify(minimalState), {
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }
}

async function resetConversationState() {
  const cookieStore = await cookies();
  cookieStore.set(
    "chatbot_state",
    JSON.stringify({
      stage: "GREETING",
      temporaryCart: [],
    }),
    {
      maxAge: 60 * 60 * 24,
      path: "/",
    }
  );
}

function extractOptionId(message: string): string | null {
  // This function should be improved to better extract IDs
  // For now, assuming the message might be the ID itself
  return message.trim();
}

function extractContactInfo(message: string): ContactInfo | null {
  try {
    const nameMatch = message.match(/Name:\s*([^,]+)/i);
    const emailMatch = message.match(/Email:\s*([^,]+)/i);
    const phoneMatch = message.match(/Phone:\s*([^,]+)/i);
    const addressMatch = message.match(/Address:\s*([^,]+)/i);
    const cityMatch = message.match(/City:\s*([^,]+)/i);

    if (nameMatch && emailMatch && phoneMatch && addressMatch) {
      return {
        name: nameMatch[1].trim(),
        email: emailMatch[1].trim(),
        phone: phoneMatch[1].trim(),
        address: addressMatch[1].trim(),
        city: cityMatch ? cityMatch[1].trim() : "Tunis", // Default to Tunis if not provided
        country: "Tunisia",
        id: "temp-" + Date.now().toString(), // Temporary ID
        orderId: "pending",
      } as ContactInfo;
    }
    return null;
  } catch (error) {
    console.error("Error extracting contact info:", error);
    return null;
  }
}

function extractShippingMethod(message: string): ShippingMethod | null {
  if (
    message.includes("STANDARD") ||
    message.toLowerCase().includes("standard")
  ) {
    return "STANDARD";
  } else if (
    message.includes("EXPRESS") ||
    message.toLowerCase().includes("express")
  ) {
    return "EXPRESS";
  }
  return null;
}
