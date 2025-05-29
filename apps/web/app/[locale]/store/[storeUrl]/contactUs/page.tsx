"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Send, CheckCircle, X, Loader2 } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import toast from "react-hot-toast";
import { getStoreByUrl } from "@/actions/storeActions";
import { useParams } from "next/navigation";
import { getStoreOwner } from "@/actions/storeUserRelationAction";
export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    imageUrl: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const storeUrl = params.storeUrl as string;
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [storeEmail, setStoreEmail] = useState<string | null>(null);
  const [contactIntroText, setContactIntroText] = useState<string | null>(null);
  const [workingTime, setWorkingTime] = useState<string | null>(null);

  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function formatOpeningHours(openingHours: {
    [day: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  }): string {
    // First, group days with the same hours together
    const hoursMap: { [key: string]: string[] } = {};

    Object.entries(openingHours).forEach(([day, hours]) => {
      if (!hours.isOpen) {
        hoursMap[`closed:${day}`] = [day];
        return;
      }

      const key = `${hours.open}-${hours.close}`;
      if (!hoursMap[key]) {
        hoursMap[key] = [];
      }
      hoursMap[key].push(day);
    });

    // Then, build the result string
    const parts: string[] = [];

    Object.entries(hoursMap).forEach(([key, days]) => {
      if (key.startsWith("closed:")) {
        const day = days[0];
        parts.push(`${day}: closed`);
        return;
      }

      const [openTime, closeTime] = key.split("-");
      const formattedOpen = formatTime(openTime);
      const formattedClose = formatTime(closeTime);

      if (days.length === 1) {
        parts.push(`${days[0]}: ${formattedOpen} to ${formattedClose}`);
      } else {
        // Sort days in week order
        const dayOrder = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];
        days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

        // Find consecutive days
        const groupedDays = groupConsecutiveDays(days, dayOrder);

        groupedDays.forEach((group) => {
          if (group.length > 2) {
            parts.push(
              `${group[0]} to ${group[group.length - 1]}: ${formattedOpen} to ${formattedClose}`
            );
          } else if (group.length === 2) {
            parts.push(
              `${group[0]} and ${group[1]}: ${formattedOpen} to ${formattedClose}`
            );
          } else {
            parts.push(`${group[0]}: ${formattedOpen} to ${formattedClose}`);
          }
        });
      }
    });

    return parts.join("; ");
  }

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours, 10);
    const minuteNum = parseInt(minutes, 10);

    if (minuteNum === 0) {
      return `${hourNum} o'clock`;
    }
    return `${hourNum}:${minutes}`;
  }

  function groupConsecutiveDays(
    days: string[],
    dayOrder: string[]
  ): string[][] {
    if (days.length <= 1) return [days];

    const result: string[][] = [];
    let currentGroup: string[] = [days[0]];

    for (let i = 1; i < days.length; i++) {
      const prevIndex = dayOrder.indexOf(days[i - 1]);
      const currentIndex = dayOrder.indexOf(days[i]);

      if (currentIndex === prevIndex + 1) {
        currentGroup.push(days[i]);
      } else {
        result.push(currentGroup);
        currentGroup = [days[i]];
      }
    }

    result.push(currentGroup);
    return result;
  }

  useEffect(() => {
    async function fetchStoreId() {
      setIsLoading(true);
      try {
        const store = await getStoreByUrl(storeUrl);
        if (store) {
          setStoreId(store.id);
          setStoreName(store.name);
          if (store.contactUs) {
            setContactIntroText(store.contactUs.introText || null);
            const workingTimeObj = JSON.parse(store.contactUs.workingTime);
            const formattedString = formatOpeningHours(workingTimeObj);
            setWorkingTime(formattedString);
          }
          const user = await getStoreOwner(store.id);
          if (user) {
            setStoreEmail(user.user.email);
            setOwnerPhone(user.user.phoneNumber);
          } else {
            console.error("No owner found for this store.");
          }
        }
      } catch (error) {
        console.error("Error fetching store:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreId();
  }, [storeUrl]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleUploadComplete = (res: any[]) => {
    if (res && res.length > 0) {
      setFormState((prev) => ({
        ...prev,
        imageUrl: res[0].url,
      }));
      toast.success("Image uploaded successfully!");
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!storeEmail) {
      toast.error("Cannot send message: Store owner email not available");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send email through API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: storeEmail,
          name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
          imageUrl: formState.imageUrl,
          storeId,
          storeName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully!");
        setIsSubmitted(true);
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
          imageUrl: "",
        });
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  return (
    <main className="flex flex-col min-h-[94vh]">
      {/* Contact Information and Form Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                  Contact Information
                </h2>
                <p className="text-gray-600 mb-8">{contactIntroText}</p>
              </div>

              {/* Contact Cards */}
              <div className="grid gap-6">
                <Card className="p-6 border border-gray-200 hover:border-[#004CFF]/30 hover:shadow-md transition-all">
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-12 h-12 bg-[#004CFF]/10 rounded-full flex items-center justify-center text-[#004CFF]">
                        <Mail className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Email</h3>
                      <p className="text-gray-600 mb-1">
                        For general inquiries
                      </p>
                      <a
                        href={`mailto:${storeEmail || "contact@monkeyprint.com"}`}
                        className="text-[#004CFF] hover:underline"
                      >
                        {storeEmail || "contact@monkeyprint.com"}
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border border-gray-200 hover:border-[#004CFF]/30 hover:shadow-md transition-all">
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-12 h-12 bg-[#004CFF]/10 rounded-full flex items-center justify-center text-[#004CFF]">
                        <Phone className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Phone</h3>
                      <p className="text-gray-600 mb-1">{workingTime}</p>
                      <a
                        href={`tel:${ownerPhone}`}
                        className="text-[#004CFF] hover:underline"
                      >
                        {ownerPhone}
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="p-8 border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Send Us a Message
                </h2>

                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-6">
                      Your message has been sent successfully. We'll get back to
                      you shortly.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formState.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Write your message here..."
                        className="min-h-[150px]"
                        required
                      />
                    </div>

                    {/* File Uploader Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attach Image (optional)
                      </label>
                      <div className="flex items-center gap-4">
                        <FileUploader
                          handleUploadComplete={handleUploadComplete}
                          buttonText={
                            formState.imageUrl ? "Change Image" : "Attach Image"
                          }
                        />
                        {formState.imageUrl && (
                          <div className="relative">
                            <img
                              src={formState.imageUrl}
                              alt="Uploaded"
                              className="h-16 w-16 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((prev) => ({
                                  ...prev,
                                  imageUrl: "",
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"
                              aria-label="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="bg-[#004CFF] hover:bg-[#0040DD] text-white w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
