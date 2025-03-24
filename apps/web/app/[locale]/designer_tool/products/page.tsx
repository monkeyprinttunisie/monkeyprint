// Home.tsx

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductSelector from "@/components/productSelector";

export default function Home() {
  const [showOptions, setShowOptions] = useState(true);
  const handleButtonClick = (link: string) => {
    console.log(`Navigating to: ${link}`);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between pt-[2vh]">

      {/* Animate the button selector options */}

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductSelector onButtonClick={handleButtonClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
