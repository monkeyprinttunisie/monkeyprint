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
    from: "Monkey Print <onboarding@resend.dev>",
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });
}

export async function sendOrderIssueEmail(
  order: OrderForEmail,
  issueType: string,
  description?: string,
  imageUrl?: string,
  email?: string
) {
  try {
    if (!email || email.trim() === "") {
      console.error("[EMAIL] No recipient email provided");
      return { success: false, error: "No recipient email provided" };
    }
    let supportEmail = email;
    console.log("[SERVER] Sending order issue email to:", supportEmail);
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
      from: "Monkey Print <onboarding@resend.dev>",
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

export async function sendContactFormEmail({
  recipient,
  name,
  email,
  subject,
  message,
  imageUrl,
  storeName,
  storeId,
}: {
  recipient: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  imageUrl?: string;
  storeName?: string;
  storeId?: string;
}) {
  try {
    if (!recipient || !name || !email || !subject || !message) {
      console.error("[EMAIL] Missing required contact form fields");
      return { success: false, error: "Missing required fields" };
    }

    console.log("[SERVER] Sending contact form email to:", recipient);

    // Create HTML content for the email
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #004CFF; margin-bottom: 20px;">New Contact Form Message</h2>
        <p style="margin-bottom: 5px;"><strong>From:</strong> ${name} (${email})</p>
        <p style="margin-bottom: 20px;"><strong>Subject:</strong> ${subject}</p>
        
        <div style="background-color: #f5f7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-line;">${message}</p>
        </div>
    `;

    // Add image if provided
    if (imageUrl) {
      htmlContent += `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Attached Image:</h3>
          <img src="${imageUrl}" alt="Attached by sender" style="max-width: 100%; max-height: 400px; border-radius: 4px;">
        </div>
      `;
    }

    // Add footer
    htmlContent += `
        <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; font-size: 12px; color: #777;">
          <p>This message was sent through the contact form on your ${storeName || "Monkey Print"} store.</p>
          ${storeId ? `<p>Store ID: ${storeId}</p>` : ""}
          <p>You can reply directly to this email to respond to the customer.</p>
        </div>
      </div>
    `;

    // Send the email
    const emailResult = await resend.emails.send({
      from: "Monkey Print <onboarding@resend.dev>",
      to: recipient,
      subject: `[Contact Form] ${subject}`,
      html: htmlContent,
    });

    if (!emailResult) {
      throw new Error("Failed to send email");
    }

    return { success: true, id: emailResult };
  } catch (error) {
    console.error("Error sending contact form email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
