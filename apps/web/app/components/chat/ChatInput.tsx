"use client";

import React, { useState } from "react";
import { useChatbot } from "@/hooks/useChatbot";

const ChatInput: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const { sendMessage, loading } = useChatbot();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() && !loading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="bg-white border-t p-3 sticky bottom-0 left-0 right-0">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Message"
          className="flex-grow p-2.5 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-400"
          disabled={loading}
        />
        <button
          type="submit"
          className={`p-2.5 rounded-r-md ${
            loading || !inputValue.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
          disabled={loading || !inputValue.trim()}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
