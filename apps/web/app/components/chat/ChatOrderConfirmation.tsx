import React from "react";

interface ChatOrderConfirmationProps {
  totalPrice: number;
  items: { name: string; quantity: number; price: number }[];
}

const ChatOrderConfirmation: React.FC<ChatOrderConfirmationProps> = ({
  totalPrice,
  items,
}) => {
  return (
    <div className="chat-order-confirmation">
      <h2 className="font-bold text-lg">Order Confirmation</h2>
      <p>Your order has been successfully created!</p>
      <p>
        Total Price: <strong>{totalPrice.toFixed(2)} dt</strong>
      </p>
      <h3 className="font-semibold">Items:</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.quantity} x {item.name} - {item.price.toFixed(2)} dt
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatOrderConfirmation;
