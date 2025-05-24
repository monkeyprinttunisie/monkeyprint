"use client";

import React from "react";
import { useChatbot } from "@/hooks/useChatbot";
import ChatContactForm from "@/components/chat/ChatContactForm";
import ChatImageUploader from "@/components/chat/ChatImageUploader";

interface Option {
  id: string;
  text: string;
  type: string;
  imageUrl?: string;
  price?: number;
}

interface ChatBubbleProps {
  message: {
    id: string;
    text: string;
    sender: "user" | "bot";
    options?: Option[];
    intent?: string;
  };
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === "user";
  const { submitContactInfo, sendMessage, uploadImage } = useChatbot();

  // Add this for handling image uploads
  const handleImageUpload = async (imageUrl: string) => {
    uploadImage(imageUrl);
  };

  // Handle upload photo intent
  if (!isUser && message.intent === "UPLOAD_PHOTO") {
    return (
      <div className="my-3 max-w-[85%] mr-auto">
        <div className="p-3 rounded-[18px] bg-blue-50 text-gray-800 rounded-bl-none shadow-sm">
          <p className="whitespace-pre-line mb-3">{message.text}</p>
          <ChatImageUploader onUploadComplete={handleImageUpload} />
        </div>
        <div className="text-xs text-gray-500 mt-1 ml-2">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  }

  if (!isUser && message.intent === "CONTACT_INFO") {
    return (
      <div className="my-3 max-w-[85%] mr-auto">
        <div className="p-3 rounded-[18px] bg-blue-50 text-gray-800 rounded-bl-none shadow-sm">
          <p className="whitespace-pre-line mb-3">{message.text}</p>
          <ChatContactForm onSubmit={submitContactInfo} />
        </div>
        <div className="text-xs text-gray-500 mt-1 ml-2">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`my-3 max-w-[85%] ${isUser ? "ml-auto" : "mr-auto"}`}>
      <div
        className={`p-3 rounded-[18px] shadow-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-blue-50 text-gray-800 rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-line">{message.text}</p>
      </div>
      <div
        className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right mr-2" : "ml-2"}`}
      >
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

export default ChatBubble;
