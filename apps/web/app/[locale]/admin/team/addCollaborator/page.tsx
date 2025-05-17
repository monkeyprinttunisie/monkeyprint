"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createUser } from "@/actions/userActions";
import { createStoreUserRelation } from "@/actions/storeUserRelationAction";
import { useCurrentStore } from "@/store/useUserStore";
import { hashPassword } from "@monkeyprint/utils/hash";

export default function AddCollaboratorPage() {
  const t = useTranslations("Team");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const store = useCurrentStore();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phoneNumber = formData.get("phoneNumber") as string;

    try {
      const hashedPassword = await hashPassword(password);

      // Create the user first
      const newUser = await createUser({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
      });

      // TODO: Replace with your store ID logic
      const storeId = store?.id as string; // You'll handle this logic

      // Create the store-user relation with COLLABORATOR role
      await createStoreUserRelation({
        storeId,
        userId: newUser.id,
        role: "COLLABORATOR",
      });

      setSuccess("Collaborator added successfully!");
      // Reset form
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      setError("Failed to add collaborator. Please try again.");
    }
  }

  return (
    <div className="flex flex-col justify-around items-center min-h-[92vh] w-screen max-w-[500px] p-9 pt-[90px]">
      <div className="absolute inset-0 -z-10 bg-[url('/bubbles-login.svg')] bg-cover bg-no-repeat rtl:scale-x-[-1]"></div>
      <div className="flex flex-col w-full justify-self-start">
        <span className="text-[52px] leading-[61px] font-bold tracking-[-0.52px] text-[#202020]">
          Add Collaborator
        </span>
        <span className="text-[19px] leading-[35px] font-light text-[#202020]">
          Add a new team member to your store
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-between h-auto w-full gap-4 my-8"
      >
        <div className="flex flex-col gap-[14px] w-full">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px]"
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            className="w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px]"
          />
        </div>

        <button
          type="submit"
          className="w-[90vw] max-w-[335px] h-[61px] p-[15.764px_19.705px] bg-[#004CFF] rounded-[16px] text-white
          transition-all duration-300 ease-in-out active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          Add Collaborator
        </button>
      </form>

      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-500 mt-4">{success}</div>}

      <div className="mt-4">
        <button
          onClick={() => router.back()}
          className="text-[14px] font-semibold leading-[17px] text-[#004CFF]"
        >
          Back to Team
        </button>
      </div>
    </div>
  );
}
