"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "@/components/oAuthSignInButton";
import Uploader from "@/components/Uploader";
import { registerSchema } from "@monkeyprint/utils/zod";
import { z } from "zod";
const roleOptions = [
  { label: "SUPER ADMIN", value: "SUPER_ADMIN" },
  { label: "ADMIN", value: "ADMIN" },
];

export default function RegisterPage() {
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    name: "",
    phoneNumber: "",
    image: "",
    role: roleOptions[1].value,
  });

  // Validation state
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    email: "",
  });

  // UI state
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode] = useState("+216");

  // Upload state
  const [imageUrl, setImageUrl] = useState<string>("");

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUploadComplete = async (res: any) => {
    if (res && res.length > 0) {
      const uploadedFile = res[0];
      if (uploadedFile && uploadedFile.ufsUrl) {
        setImageUrl(uploadedFile.ufsUrl);
        setFormData({
          ...formData,
          image: uploadedFile.ufsUrl,
        });
      }
    }
  };

  const nextStep = () => {
    // Validate first step
    let isValid = true;
    const newErrors = { ...errors };
    let errorMessages = [];
    try {
      registerSchema.shape.email.parse(formData.email);
      newErrors.email = "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
        errorMessages.push("Email is invalid");
        isValid = false;
      }
    }

    try {
      registerSchema.shape.password.parse(formData.password);
      newErrors.password = "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
        errorMessages.push("Password must be at least 8 characters");
        isValid = false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      errorMessages.push("Passwords do not match");
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      setMessage(errorMessages[0]);
      return;
    }

    setStep(2);
    setMessage(null);
  };

  const prevStep = () => {
    setStep(1);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    // Combine phone with country code
    const fullPhoneNumber = countryCode + formData.phoneNumber;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: fullPhoneNumber,
          image: imageUrl || formData.image,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("User created successfully!");
        // Redirect to login after successful registration
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        setMessage(result.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare upload token for UploadThing
  const apiKey = process.env.UPLOADTHING_TOKEN;
  const appId = process.env.UPLOADTHING_APP_ID;
  const regions = process.env.UPLOADTHING_REGIONS?.split(",") || ["us", "eu"];
  const tokenData = { apiKey, appId, regions };
  const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString(
    "base64"
  );

  return (
    <div className="bg-[url('/icons/register-bg.svg')] bg-cover bg-center px-5 h-screen flex flex-col  max-h-[92vh] justify-center overflow-auto">
      {/* Success notification */}
      {message && (
        <div
          className={`fixed top-6 left-0 right-0 mx-auto w-5/6 max-w-sm p-3 rounded-lg text-sm  z-50 shadow-md ${
            message.includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="w-full max-w-md mt-[0vh] max-h-[100vh]">
        {step === 1 ? (
          /* Step 1: Basic Info */
          <div className=" flex flex-col ">
            <h1 className="text-5xl font-semibold text-gray-900 text-left w-[50vw] mb-5">
              Create Store
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5 w-full">
              <div className="space-y-4">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Email"
                />

                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Password"
                />

                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Confirm Password"
                />

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out shadow-md"
                  >
                    Next
                  </button>
                </div>

                <div className="relative flex items-center justify-center mt-4">
                  <div className="border-t border-gray-300 w-1/4"></div>
                  <span className="px-3 text-gray-500 text-sm bg-white">
                    OR Continue with
                  </span>
                  <div className="border-t border-gray-300 w-1/4"></div>
                </div>

                <div className="flex justify-center space-x-4 pt-2">
                  <SignIn provider="google" className="justify-self-end" />
                  <SignIn provider="facebook" className="justify-self-start" />
                </div>

                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/auth/login")}
                      className="text-blue-600 cursor-pointer font-medium hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: Store Details */
          <div className="flex flex-col mt-[14vh] ">
            <h1 className="text-5xl font-semibold text-gray-900 text-left w-[50vw] mt-8">
              Create Store
            </h1>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 w-full text-left"
            >
              <div className="space-y-4">
                <div className="flex flex-col mb-6">
                  {imageUrl ? (
                    <div className="relative mt-4 w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img src={imageUrl} alt="Store logo" />
                    </div>
                  ) : (
                    <Uploader handleUploadComplete={handleUploadComplete} />
                  )}
                </div>

                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="First Name"
                />

                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Last Name"
                />

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Store Name"
                />

                <div className="flex items-center bg-[#E0E9FC] rounded-full pl-4">
                  <div className="flex items-center pr-4 border-r border-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="text-[#2554b8] font-['Raleway'] text-[17px]">
                        +216
                      </span>
                      <img
                        src="/icons/down-arrow-icon.svg"
                        alt="Select country code"
                        className="mx-2 w-4 h-2"
                      />
                    </div>
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full text-[#2554b8] px-3 h-[6vh] rounded-full bg-transparent border-none font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none"
                    placeholder="Your number"
                  />
                </div>

                <div className="flex justify-between pt-8 gap-4 mb-[12vh]">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out shadow-md"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out shadow-md disabled:bg-blue-300"
                  >
                    {isSubmitting ? "Submitting..." : "Done"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
