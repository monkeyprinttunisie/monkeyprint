import { useState } from "react";
import {
  sendContactInfoToChatbot,
  sendMessageToChatbot,
} from "@/actions/chatbotActions";
import { useChatStore } from "@/store/ChatStore";
import { ContactInfo } from "@/types";
import { useParams } from "next/navigation";

// Define the response type to match what the server returns
interface ChatbotResponse {
  success: boolean;
  message: string;
  intent?: string;
  order?: any;
  options?: Array<{
    id: string;
    text: string;
    type: string;
    imageUrl?: string;
    price?: number;
  }>;
  cart?: any[];
}

export const useChatbot = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const addBotMessage = useChatStore((state) => state.addBotMessage);
  const setOrderConfirmation = useChatStore(
    (state) => state.setOrderConfirmation
  );
  const setTemporaryCart = useChatStore((state) => state.setTemporaryCart);
  const params = useParams();
  const storeUrl = params.storeUrl as string;

  const handleSendMessage = async (userMessage: string, optionId?: string) => {
    if (!userMessage.trim()) return;

    sendMessage(userMessage, optionId);
    setLoading(true);
    setError(null);

    try {
      // Pass both the message text and the option ID
      console.log("Sending message:", userMessage, "optionId:", optionId);
      const response = (await sendMessageToChatbot(
        userMessage,
        optionId,
        storeUrl
      )) as ChatbotResponse;
      console.log("Response received:", response);

      if (response && response.success) {
        addBotMessage(response.message, response.options, response.intent);

        // Update temporary cart if provided
        if (response.cart) {
          setTemporaryCart(response.cart);
        }

        // Handle order completion
        if (response.intent === "ORDER_CREATED" && response.order) {
          setOrderConfirmation(response.order);
          // Clear temporary cart when order is created
          setTemporaryCart([]);
        }
      } else {
        const errorMsg = response ? response.message : "Unknown error";
        console.error("Error from chatbot:", errorMsg);
        addBotMessage(
          "I'm sorry, something went wrong. Please try again. (Error: " +
            errorMsg +
            ")"
        );
        setError(errorMsg || "Error processing message");
      }
    } catch (err) {
      console.error("Exception in chatbot:", err);
      addBotMessage(
        `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setError("An error occurred while processing your message.");
    } finally {
      setLoading(false);
    }
  };

  // Add function to submit contact info directly
  const submitContactInfo = async (contactInfo: ContactInfo) => {
    setLoading(true);
    setError(null);

    try {
      const response = (await sendContactInfoToChatbot(
        contactInfo
      )) as ChatbotResponse;

      if (response.success) {
        addBotMessage(response.message, response.options, response.intent);

        if (response.cart) {
          setTemporaryCart(response.cart);
        }
      } else {
        addBotMessage("I'm sorry, something went wrong. Please try again.");
        setError(response.message || "Error processing contact information");
      }
    } catch (err) {
      addBotMessage(
        "Sorry, I encountered an error processing your contact information."
      );
      setError("An error occurred while processing your contact information.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (imageUrl: string) => {
    try {
      const hostname = window.location.hostname.split(".")[0];
      setLoading(true);
      const response = await fetch("/api/chat/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl, storeUrl }),
      });

      const data = await response.json();

      if (data.success) {
        addBotMessage(data.message);
      } else {
        addBotMessage(
          "Sorry, there was an error processing your image. Please try again or describe the issue instead."
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      addBotMessage(
        "Sorry, there was an error processing your image. Please try again or describe the issue instead."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage: handleSendMessage,
    submitContactInfo,
    uploadImage,
  };
};
