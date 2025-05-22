"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormState({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="flex flex-col h-[94vh]">
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
                <p className="text-gray-600 mb-8">
                  Have questions or need assistance? Reach out to us using any
                  of the methods below or fill out the contact form, and we'll
                  get back to you as soon as possible.
                </p>
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
                        href="mailto:contact@monkeyprint.com"
                        className="text-[#004CFF] hover:underline"
                      >
                        contact@monkeyprint.com
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
                      <p className="text-gray-600 mb-1">
                        Mon-Fri from 9am to 5pm
                      </p>
                      <a
                        href="tel:+21670111222"
                        className="text-[#004CFF] hover:underline"
                      >
                        +216 70 111 222
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
