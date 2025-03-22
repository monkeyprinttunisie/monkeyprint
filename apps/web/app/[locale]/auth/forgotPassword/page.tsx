"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Password reset email sent!");
      } else {
        setMessage(result.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 relative overflow-hidden">
      {/* Top-right decorative shapes */}
      <div className="absolute -top-10 -right-9 w-[374px] transform -rotate-[0deg]">
        <img src="/icons/bubble02.svg" alt="" className="w-full" />
      </div>
      <div className="absolute -right-30 -top-20 w-[403px] transform -rotate-z-10">
        <img src="/icons/bubble01.svg" alt="" className="w-full" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="fixed right-0 top-[13vh] left-0">
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full p-1 mb-6 border-3 border-white shadow-lg">
              <img
                src="/icons/avatar.svg"
                alt="Reset password"
                className="w-24 h-24 p-1 rounded-[100%]"
              />
            </div>
            <h1 className="text-2xl font-medium text-gray-900 text-center">
              Password Recovery
            </h1>
            <p className="text-black font-light text-xl text-center mt-2">
              Please enter your email address below
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 fixed top-[41vh] left-[5vw] right-[5vw]">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-[#2554b8] p-3 bg-[#E0E9FC] border-none rounded-[9px] font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Email"
            />
            <p className="text-s text-[#676767] mt-1">
              <span className="text-[#FF4B26]">*</span> We will send you a
              message to set your new password
            </p>
          </div>

          <div className="fixed bottom-[11vh] space-y-4 left-0 right-0 px-8 w-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out disabled:bg-blue-300"
            >
              {isSubmitting ? "Sending..." : "Next"}
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full text-center text-[15px] text-[#202020] opacity-90 font-light"
            >
              Cancel
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("sent")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
