"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { cn } from "@/lib/utils";

interface CardCarouselProps {
  cards: ReactNode[];
}

export default function CardCarousel({ cards }: CardCarouselProps) {
  const [selected, setSelected] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setSelected(api.selectedScrollSnap()); // Get current active slide
    };

    api.on("select", handleSelect); // Listen for slide change event

    return () => {
      api.off("select", handleSelect); // Cleanup event listener
    };
  }, [api]);

  return (
    <div className="w-full flex flex-col items-center">
      <Carousel opts={{ loop: true }} setApi={setApi} className="w-full">
        <CarouselContent>
          {cards.map((item, index) => (
            <CarouselItem key={index} className="flex justify-center">
              {item}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex gap-2 mt-4">
        {cards.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              selected === index ? "w-6 bg-blue-600" : "w-2 bg-blue-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
