"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Printer,
  Recycle,
  Users,
  Sparkles,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Mail,
} from "lucide-react";

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: "Custom t-shirts being printed",
      caption: "Premium quality t-shirts with vibrant prints",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: "Custom mugs",
      caption: "Personalized mugs that make perfect gifts",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: "Custom posters",
      caption: "High-resolution poster prints for any space",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: "Custom phone cases",
      caption: "Durable phone cases with your unique designs",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === carouselImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <main className="flex flex-col h-[94vh] bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#004CFF]/10 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-[#004CFF]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            About PrintWave
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              PrintWave is a print-on-demand platform designed to help creators,
              entrepreneurs, and businesses bring their unique designs to life
              through quality products.
            </p>
            <p className="text-lg text-gray-700">
              Our user-friendly interface and powerful tools make it easy to
              create, sell, and ship custom products without inventory or
              upfront costs.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">
              How Print-On-Demand Works
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              No inventory, no risk, just quality products with your unique
              touch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[#004CFF] text-white rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                1. Choose a Product
              </h3>
              <p className="text-gray-700">
                Browse through our selection of high-quality products and find
                the perfect item that matches your idea.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[#004CFF] text-white rounded-full flex items-center justify-center mb-4">
                <Printer className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                2. We Print Your Order
              </h3>
              <p className="text-gray-700">
                When an order comes in, we print your design on the selected
                product using state-of-the-art technology.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[#004CFF] text-white rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                3. Fast Shipping
              </h3>
              <p className="text-gray-700">
                We package and ship directly to your address.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#004CFF]/10 text-[#004CFF] rounded-lg flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Quality First
                </h3>
                <p className="text-gray-700">
                  From premium materials to meticulous printing, we ensure every
                  product meets our high standards.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#004CFF]/10 text-[#004CFF] rounded-lg flex items-center justify-center">
                  <Recycle className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Sustainability
                </h3>
                <p className="text-gray-700">
                  We only produce what's ordered, use eco-friendly inks, and
                  continuously reduce our environmental footprint.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#004CFF]/10 text-[#004CFF] rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Creator Support
                </h3>
                <p className="text-gray-700">
                  Our platform is designed with transparent pricing, marketing
                  tools, and dedicated support.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#004CFF]/10 text-[#004CFF] rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Innovation
                </h3>
                <p className="text-gray-700">
                  We're constantly exploring new printing techniques and
                  products to keep you at the cutting edge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">
              Our Products
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              High-quality print-on-demand products for every need
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={carouselImages[currentSlide].src || "/placeholder.svg"}
                  alt={carouselImages[currentSlide].alt}
                  fill
                  className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <p className="text-white text-xl font-medium p-6">
                    {carouselImages[currentSlide].caption}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="flex justify-center mt-4 space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-[#004CFF]" : "bg-gray-300"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Need Help?
            </h2>
            <p className="text-gray-700 mb-6">
              If you need help or you have any questions, our support team is
              ready to assist you.
            </p>
            <div className="flex flex-col items-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center bg-[#004CFF] hover:bg-[#0040DD] text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
