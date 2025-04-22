"use client";

import { useState } from "react";
import Image from "next/image";
import IconButton from "@/components/iconButton";

type WalletMenuProps = {
    imageUrl: string;
    title?: string;
};

export default function WalletMenu({ imageUrl, title}: WalletMenuProps) {
    // State to track which content is currently displayed
    const [activeTab, setActiveTab] = useState<"transactions" | "cards" | "settings">("transactions");

    return (
        <div className="wallet-menu  bg-white rounded-lg ">
            {/* Header with profile image, text, and icon buttons */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Profile image in a white rounded container */}
                    <div className="rounded-full bg-white p-0.5  border">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                src={imageUrl || "/icons/default-avatar.svg"}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    {/* "My Wallet" text */}
                    <span className="text-black font-bold text-lg">{title}</span>
                </div>

            </div>
        </div>
    );
}