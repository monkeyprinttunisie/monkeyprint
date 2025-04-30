import { createStore } from "zustand/vanilla";
import { ChatOrder, CartItem } from "@/types";
import { useStore } from "zustand";

interface ChatState {
  messages: {
    id: string;
    text: string;
    sender: "user" | "bot";
    optionId?: string; // Store the option ID for processing
    intent?: string; // Add intent to the message type
    options?: Array<{
      id: string;
      text: string;
      type: string;
      imageUrl?: string;
      price?: number;
    }>;
  }[];
  temporaryCart: CartItem[];
  orderConfirmation: ChatOrder | null;
  sendMessage: (text: string, optionId?: string) => void;
  addBotMessage: (text: string, options?: any[], intent?: string) => void; // Update function signature
  setOrderConfirmation: (order: ChatOrder | null) => void;
  setTemporaryCart: (cart: CartItem[]) => void;
  clearMessages: () => void;
}

export const chatStore = createStore<ChatState>((set) => ({
  messages: [],
  temporaryCart: [],
  orderConfirmation: null,
  sendMessage: (text, optionId) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          text,
          sender: "user",
          optionId,
        },
      ],
    })),
  addBotMessage: (
    text,
    options,
    intent // Add intent as parameter
  ) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          text,
          sender: "bot",
          options,
          intent, // Use the intent parameter
        },
      ],
    })),
  setOrderConfirmation: (order) => set({ orderConfirmation: order }),
  setTemporaryCart: (cart) => set({ temporaryCart: cart }),
  clearMessages: () => set({ messages: [], temporaryCart: [] }),
}));

// Hook to use in components
export const useChatStore = <T>(selector: (state: ChatState) => T): T => {
  return useStore(chatStore, selector);
};
