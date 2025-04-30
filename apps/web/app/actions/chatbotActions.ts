"use server";

import { CartItem, ContactInfo, Product } from "@/types";
import { ShippingMethod } from "@monkeyprint/db";
import { cookies } from "next/headers";

import { createOrder as createOrderAction } from "@/actions/orderActions";
import { listCategories } from "@/actions/categoryActions";
import {
  getProductsByCategory as getProductsByCategoryAction,
  getProductById as getProductByIdAction,
} from "@/actions/productActions";

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
    | "CONFIRMATION";
  selectedCategory?: string;
  selectedProduct?: Product;
  temporaryCart: CartItem[];
  contactInfo?: ContactInfo;
  shippingMethod?: ShippingMethod;
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
        if (
          message.toLowerCase().includes("order") ||
          message.toLowerCase().includes("buy")
        ) {
          // Move to category selection
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
              "Great! To proceed, I'll need your contact information. Please provide your full name, email, phone number, and delivery address in this format: Name: [your name], Email: [your email], Phone: [your phone], Address: [your address], City: [your city]",
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
