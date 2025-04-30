"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/ChatStore";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import ChatOrderConfirmation from "@/components/chat/ChatOrderConfirmation";
import { CartItem } from "@/types";
import { resetChatbotState } from "@/actions/chatbotActions";
import SlideUpPanel from "@/components/SlideUpPanel";
import { useChatbot } from "@/hooks/useChatbot";

interface Option {
  id: string;
  text: string;
  type: string;
  imageUrl?: string;
  price?: number;
}

const ChatContainer: React.FC = () => {
  const messages = useChatStore((state) => state.messages);
  const addBotMessage = useChatStore((state) => state.addBotMessage);
  const orderConfirmation = useChatStore((state) => state.orderConfirmation);
  const temporaryCart = useChatStore((state) => state.temporaryCart);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<any[]>([]);

  useEffect(() => {
    if (messages.length === 0) {
      // Add initial greeting message directly to the UI without server call
      addBotMessage(
        "Hello! I'm your MonkeyPrint assistant. How can I help you today?",
        [
          {
            id: "start_order",
            text: "Create a new order",
            type: "action",
          },
        ]
      );
    }
  }, [messages.length, addBotMessage]);

  // Handle options display
  useEffect(() => {
    // Find the last message with options
    const lastMessageWithOptions = [...messages]
      .reverse()
      .find(
        (message) =>
          message.sender === "bot" &&
          message.options &&
          message.options.length > 0
      );

    if (lastMessageWithOptions?.options) {
      setCurrentOptions(lastMessageWithOptions.options);
      setOptionsVisible(true);
    } else {
      setOptionsVisible(false);
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, temporaryCart]);

  const getPanelTitle = (): string => {
    if (!currentOptions || currentOptions.length === 0) {
      return "Options";
    }

    // Check the first option to determine the context
    const firstOption = currentOptions[0];

    // Determine title based on option types
    if (firstOption.type === "product") {
      return "Select a Product";
    }

    // Check for specific action types
    if (firstOption.type === "action") {
      if (firstOption.id === "confirm" || firstOption.id === "cancel") {
        return "Confirm Your Action";
      }

      // Check for payment related options
      if (
        firstOption.id.includes("payment") ||
        firstOption.text.toLowerCase().includes("pay")
      ) {
        return "Payment Options";
      }

      // Check for order related options
      if (
        firstOption.id.includes("order") ||
        firstOption.text.toLowerCase().includes("order")
      ) {
        return "What's your issue?";
      }
    }

    // Check text content of options for contextual clues
    const allTexts = currentOptions
      .map((opt) => opt.text.toLowerCase())
      .join(" ");
    if (allTexts.includes("issue") || allTexts.includes("problem")) {
      return "What's your issue?";
    }
    if (allTexts.includes("size") || allTexts.includes("color")) {
      return "Select Options";
    }
    if (allTexts.includes("delivery") || allTexts.includes("shipping")) {
      return "Delivery Options";
    }

    // Default generic title
    return "Available Options";
  };

  return (
    <div className="flex flex-col h-[90vh] bg-white rounded-lg shadow-lg relative">
      <div className="p-3 bg-blue-500 text-white rounded-t-lg flex items-center">
        <div className="w-10 h-10 rounded-full bg-white mr-3 overflow-hidden flex items-center justify-center">
          <img
            src="/icons/chat-icon.svg"
            alt="Bot Avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/200?text=MP";
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-semibold">MonkeyPrint Assistant</h2>
          <p className="text-xs opacity-80">Customer Care Service</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            👋 Hi there! How can I help you today?
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}

        {temporaryCart && temporaryCart.length > 0 && (
          <div className="my-4 p-3 border border-blue-200 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Your Current Cart</h3>
            <ul>
              {temporaryCart.map((item: CartItem) => (
                <li key={item.id} className="flex justify-between mb-1">
                  <span>
                    {item.quantity} x {item.name}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} DT</span>
                </li>
              ))}
            </ul>
            <div className="border-t mt-2 pt-2 font-semibold flex justify-between">
              <span>Subtotal:</span>
              <span>
                {temporaryCart
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )
                  .toFixed(2)}{" "}
                DT
              </span>
            </div>
          </div>
        )}

        {orderConfirmation && (
          <div className="my-4 p-3 border border-green-200 bg-white rounded-lg shadow-sm">
            <ChatOrderConfirmation
              totalPrice={orderConfirmation.totalPrice}
              items={orderConfirmation.items}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput />

      <div className="px-4 py-2 text-center border-t border-gray-100">
        <button
          onClick={async () => {
            await resetChatbotState();
            window.location.reload();
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors shadow-sm flex items-center justify-center mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset Chat
        </button>
      </div>

      {/* Options Panel */}
      <SlideUpPanel
        isOpen={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        title={getPanelTitle()}
        disableBackdropBlur={true}
      >
        <div className="flex flex-col space-y-3">
          {currentOptions.map((option) => (
            <div key={option.id}>
              {option.type === "product" ? (
                <ChatOptionProduct
                  option={option}
                  onClose={() => setOptionsVisible(false)}
                />
              ) : (
                <ChatOptionButton
                  option={option}
                  onClose={() => setOptionsVisible(false)}
                />
              )}
            </div>
          ))}
          <button
            onClick={() => setOptionsVisible(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-medium mt-4"
          >
            Next
          </button>
        </div>
      </SlideUpPanel>
    </div>
  );
};

// Helper components for options
const ChatOptionButton = ({
  option,
  onClose,
}: {
  option: Option;
  onClose: () => void;
}) => {
  const { sendMessage } = useChatbot();

  const handleClick = () => {
    sendMessage(option.text, option.id);
    onClose();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 rounded-md border flex items-center ${
        option.type === "action" && option.id === "confirm"
          ? "bg-green-50 border-green-200 text-green-700"
          : option.type === "action" && option.id === "cancel"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-blue-50 border-blue-200 text-blue-700"
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {option.text}
    </button>
  );
};

const ChatOptionProduct = ({
  option,
  onClose,
}: {
  option: Option;
  onClose: () => void;
}) => {
  const { sendMessage } = useChatbot();

  const handleClick = () => {
    sendMessage(option.text, option.id);
    onClose();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
    >
      <div className="flex items-center">
        {option.imageUrl && (
          <img
            src={option.imageUrl}
            alt={option.text}
            className="w-16 h-16 object-cover rounded mr-3"
          />
        )}
        <div>
          <div className="font-medium">{option.text}</div>
          {option.price !== undefined && (
            <div className="text-sm text-gray-600">
              {option.price.toFixed(2)} DT
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatContainer;
