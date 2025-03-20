"use client";

import ScrollableNavBar from "@/components/scrollableNavigationBar";
import { ReactNode, useEffect, useState } from "react";

export default function DesignerToolLayout({ children }: { children: ReactNode }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Create a skeleton loader for server-side rendering
    if (!isClient) {
        return (
            <div suppressHydrationWarning>
                {/* Minimal placeholder for ScrollableNavBar */}
                <div className="w-full h-[9.5vh] bg-white shadow-lg fixed bottom-0 left-0 z-50 pt-1"></div>
                <main>{children}</main>
            </div>
        );
    }

    return (
        <div suppressHydrationWarning>
            <ScrollableNavBar />
            <main>{children}</main>
        </div>
    );
}