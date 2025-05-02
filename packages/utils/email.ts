import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
export interface OrderForEmail {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: Date | string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/resetPassword?token=${token}`;

  await resend.emails.send({
    from: "contact@monkeyprinttunisie.com",
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });
}

export async function sendOrderIssueEmail(
  order: OrderForEmail,
  issueType: string,
  description?: string,
  imageUrl?: string
) {
  try {
    const supportEmail = "ahmedzouaghi2003@gmail.com"; // Shop owner email

    // Format the order items for the email
    const itemsList = order.items
      .map(
        (item) => `${item.quantity}x ${item.name} (${item.price.toFixed(2)} DT)`
      )
      .join("<br>");

    // Generate email content based on issue type
    let emailSubject = `Order Issue: ${issueType} - Order #${order.id.slice(0, 8)}`;
    let emailContent = `
      <h2>Order Issue Reported</h2>
      <p><strong>Issue Type:</strong> ${issueType}</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.contactInfo?.name || "Unknown"}</p>
      <p><strong>Phone:</strong> ${order.contactInfo?.phone || "Unknown"}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      
      <h3>Order Details:</h3>
      <p><strong>Items:</strong><br>${itemsList}</p>
      <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)} DT</p>
      <p><strong>Status:</strong> ${order.status}</p>
    `;

    // Add description if available
    if (description) {
      emailContent += `<h3>Customer Description:</h3>
      <p>${description}</p>`;
    }

    // Add image if available
    if (imageUrl) {
      emailContent += `<h3>Image Uploaded:</h3>
      <p><img src="${imageUrl}" alt="Damaged product" style="max-width: 100%; max-height: 400px;"></p>`;
    }

    // Send the email
    await resend.emails.send({
      from: "contact@monkeyprinttunisie.com",
      to: supportEmail,
      subject: emailSubject,
      html: emailContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending order issue email:", error);
    return { success: false, error: "Failed to send email notification" };
  }
}
