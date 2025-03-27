"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully!");
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
    <div className="min-h-[92vh] flex flex-col items-center justify-center bg-white px-4 py-12 relative overflow-hidden">
      {/* Top-right decorative shapes */}
      <div className="absolute -top-10 -right-9 w-[374px] transform -rotate-[0deg]">
        <img src="/icons/bubble02.svg" alt="" className="w-full" />
      </div>
      <div className="absolute -right-30 -top-20 w-[403px] transform -rotate-z-10">
        <img src="/icons/bubble01.svg" alt="" className="w-full" />
      </div>
      {message && (
        <div
          className={`fixed top-[3vh] left-0 right-0 mx-auto w-[90%] max-w-md p-4 rounded-lg text-center shadow-md z-50 ${
            message.includes("successfully")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="fixed right-0 top-[14vh] left-0">
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full p-1 mb-6 border-3 border-white shadow-lg">
              <img
                src="/icons/avatar.svg"
                alt="Reset password"
                className="w-24 h-24 p-1 rounded-[100%]"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 text-center">
              Setup New Password
            </h1>
            <p className="text-black font-light text-l text-center mt-2 mx-2">
              Please, setup a new password for your account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-1 fixed top-[45vh] left-[5vw] right-[5vw]">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-[#2554b8] p-3 py-3.2 mb-6 bg-[#E0E9FC] border-none rounded-[9px] font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="New Password"
            />

            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full text-[#2554b8] p-3 py-3.2 bg-[#E0E9FC] border-none rounded-[9px] font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm New Password"
            />
            <p className="text-s text-[#676767] mt-1">
              <span className="text-[#FF4B26]">*</span> Both passwords must
              match
            </p>
          </div>

          <div className="fixed bottom-[5vh] space-y-4 left-0 right-0 px-8 w-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out disabled:bg-blue-300"
            >
              {isSubmitting ? "Submitting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="w-full text-center text-[15px] text-[#202020] opacity-90 font-light"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
