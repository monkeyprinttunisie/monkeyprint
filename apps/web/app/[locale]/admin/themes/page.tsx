"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ExternalLink, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
export default function ThemeConfigPage() {
  const [selectedTheme, setSelectedTheme] = useState("theme2");
  const [bannersExpanded, setBannersExpanded] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#f5c242");
  const [tertiaryColor, setTertiaryColor] = useState("#f5c242");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [ctaTextColor, setCtaTextColor] = useState("#000000");
  const [ctaBgColor, setCtaBgColor] = useState("#000000");
  const [logoSrc, setLogoSrc] = useState("/file-text.svg");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [headerText, setHeaderText] = useState("✨ Explore our collection ✨");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [banners, setBanners] = useState([
    {
      id: "banner-1",
      title: "",
      description: "",
      cta: "Order Now",
      link: "/",
      position: "center",
    },
  ]);
  const [storeData, setStoreData] = useState({
    name: "Shopify",
    title: "Shopify",
    domain: "shopify.converty.shop",
    phone: "",
    email: "",
    facebook: "",
    seoDescription: "",
    instagram: "",
    tiktok: "",
    whatsapp: "",
    whatsappIcon: "",
  });
  //banner functions
  const deleteBanner = (bannerId: string) => {
    setBanners(banners.filter((banner) => banner.id !== bannerId));
  };
  const addBanner = () => {
    const newBanner = {
      id: `banner-${banners.length + 1}-${Date.now()}`, // Ensure unique ID
      title: "",
      description: "",
      cta: "Order Now",
      link: "/",
      position: "center",
    };
    setBanners([...banners, newBanner]);
  };

  //colors functions
  const handleLogoChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  //logo functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setLogoSrc(imageUrl);
    }
  };

  //store info functions
  const handleChange = (field: string, value: string) => {
    setStoreData({
      ...storeData,
      [field]: value,
    });
  };
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
          <h1 className="text-xl font-semibold">Theme Settings</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Selected Theme */}
        <div className="rounded-lg border shadow-sm">
          <h2 className="border-b p-4 text-lg font-medium">Selected Theme</h2>

          {/* Slider container with overflow indicators */}
          <div className="relative p-6">
            {/* Visual indicator for more content (left shadow) */}
            <div className="absolute inset-y-0 left-0 z-2 w-12 bg-gradient-to-r from-white/80 to-transparent pointer-events-none"></div>

            {/* Carousel */}
            <div
              id="theme-carousel"
              className="flex w-full gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Theme 1 */}
              <div
                className="flex-shrink-0 w-[280px] cursor-pointer transition-all duration-200 snap-center"
                onMouseEnter={() => setHoveredCard("theme1")}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setSelectedTheme("theme1")}
              >
                <Card
                  className={`overflow-hidden mx-1 my-1 py-1 relative  ${
                    selectedTheme === "theme1"
                      ? "ring-2 ring-blue-600"
                      : hoveredCard === "theme1"
                        ? "shadow-lg"
                        : ""
                  }`}
                >
                  <div className="p-4 pb-10 ">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                      <Image
                        src="/images/template-3.jpg"
                        alt="Theme Simple"
                        width={400}
                        height={300}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium -mt-5">Simple</h3>
                    </div>

                    <div className="absolute bottom-2 left-4 right-4 h-8">
                      <p
                        className={`text-sm text-muted-foreground absolute inset-0 transition-all duration-300 ${
                          hoveredCard === "theme1" || selectedTheme === "theme1"
                            ? "transform translate-y-full opacity-0"
                            : "transform translate-y-0 opacity-100"
                        }`}
                      >
                        Ideal for a minimalist and elegant style.
                      </p>

                      <div
                        className={`flex justify-between space-x-2 absolute inset-0 transition-all duration-300 ${
                          hoveredCard === "theme1" || selectedTheme === "theme1"
                            ? "transform translate-y-0 opacity-100"
                            : "transform translate-y-full opacity-0"
                        }`}
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className={`${
                            selectedTheme === "theme1"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                        >
                          {selectedTheme === "theme1" ? "Deselect" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Theme 2 */}
              <div
                className="flex-shrink-0 w-[280px] cursor-pointer transition-all duration-200 snap-center"
                onMouseEnter={() => setHoveredCard("theme2")}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setSelectedTheme("theme2")}
              >
                <Card
                  className={`overflow-hidden mx-1 my-1 py-1 relative  ${
                    selectedTheme === "theme2"
                      ? "ring-2 ring-blue-600"
                      : hoveredCard === "theme2"
                        ? "shadow-lg"
                        : ""
                  }`}
                >
                  <div className="p-4 pb-10 ">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                      <Image
                        src="/images/template-3.jpg"
                        alt="Theme Simple"
                        width={400}
                        height={300}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium -mt-5">Simple</h3>
                    </div>

                    <div className="absolute bottom-2 left-4 right-4 h-8">
                      <p
                        className={`text-sm text-muted-foreground absolute inset-0 transition-all duration-300 ${
                          hoveredCard === "theme2" || selectedTheme === "theme2"
                            ? "transform translate-y-full opacity-0"
                            : "transform translate-y-0 opacity-100"
                        }`}
                      >
                        Ideal for a minimalist and elegant style.
                      </p>

                      <div
                        className={`flex justify-between space-x-2 absolute inset-0 transition-all duration-300 ${
                          hoveredCard === "theme2" || selectedTheme === "theme2"
                            ? "transform translate-y-0 opacity-100"
                            : "transform translate-y-full opacity-0"
                        }`}
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className={`${
                            selectedTheme === "theme2"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                        >
                          {selectedTheme === "theme2" ? "Deselect" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Theme 3 */}
              <div
                className="flex-shrink-0 w-[280px] cursor-pointer transition-all duration-200 snap-center"
                onMouseEnter={() => setHoveredCard("theme3")}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setSelectedTheme("theme3")}
              >
                <Card
                  className={`overflow-hidden mx-1 my-1 py-1 relative  ${
                    selectedTheme === "theme3"
                      ? "ring-2 ring-blue-600"
                      : hoveredCard === "theme3"
                        ? "shadow-lg"
                        : ""
                  }`}
                >
                  <div className="p-4 pb-10 ">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                      <Image
                        src="/images/template-3.jpg"
                        alt="Theme Simple"
                        width={400}
                        height={300}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium -mt-5">Simple</h3>
                    </div>

                    <div className="absolute bottom-2 left-4 right-4 h-8">
                      <p
                        className={`text-sm text-muted-foreground absolute inset-0 transition-all duration-300 ${
                          hoveredCard === "theme3" || selectedTheme === "theme3"
                            ? "transform translate-y-full opacity-0"
                            : "transform translate-y-0 opacity-100"
                        }`}
                      >
                        Ideal for a minimalist and elegant style.
                      </p>

                      <div
                        className={`flex justify-between space-x-2 absolute inset-0 transition-all duration-300 ${
                          hoveredCard === "theme3" || selectedTheme === "theme3"
                            ? "transform translate-y-0 opacity-100"
                            : "transform translate-y-full opacity-0"
                        }`}
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className={`${
                            selectedTheme === "theme3"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                        >
                          {selectedTheme === "theme3" ? "Deselect" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Visual indicator for more content (right shadow) */}
            <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white/80 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Home Banners */}
        <div className="rounded-lg border shadow-sm">
          <div
            className="flex cursor-pointer items-center justify-between border-b p-4"
            onClick={() => setBannersExpanded(!bannersExpanded)}
          >
            <div className="flex items-center">
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M9 1v1h1v1H9v1h1v1H9v1h1v1H9v1h1v1H9v1h1v1H9v1h1v1H9v1h1v1H9v1h1v1H9v1h1v1H9v1h6v-1h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1v-1h-1v-1h1v-1h-1V1H9z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium">Home Banners</h2>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent section from collapsing
                  addBanner();
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add a banner
              </Button>
              {bannersExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>

          {/* Banner content - inside the container */}
          {bannersExpanded && (
            <div className="p-4 space-y-6">
              {banners.length > 0 ? (
                banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="grid gap-6 p-4 border border-gray-300 bg-gray-50 rounded-lg relative"
                  >
                    {/* Delete button - top right corner */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                      onClick={() => deleteBanner(banner.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                      </svg>
                      <span className="ml-1">Delete</span>
                    </Button>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <h3 className="mb-4 font-medium">Image</h3>
                        <div className="aspect-video overflow-hidden rounded-md bg-blue-600">
                          <div className="flex h-full flex-col items-center justify-center text-white">
                            <p className="text-center text-sm">
                              Place your banner
                            </p>
                            <p className="text-center text-sm">image here</p>
                            <button className="mt-2 rounded-full bg-yellow-400 px-4 py-1 text-xs text-black">
                              {banner.cta || "Order Now"}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 md:col-span-2">
                        <div>
                          <label htmlFor={`title-${banner.id}`}>Title</label>
                          <Input
                            id={`title-${banner.id}`}
                            placeholder="Title"
                            className="mt-1"
                            value={banner.title}
                            onChange={(e) => {
                              const updatedBanners = banners.map((b) =>
                                b.id === banner.id
                                  ? { ...b, title: e.target.value }
                                  : b
                              );
                              setBanners(updatedBanners);
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor={`description-${banner.id}`}>
                            Description
                          </label>
                          <Textarea
                            id={`description-${banner.id}`}
                            placeholder="Description"
                            className="mt-1"
                            value={banner.description}
                            onChange={(e) => {
                              const updatedBanners = banners.map((b) =>
                                b.id === banner.id
                                  ? { ...b, description: e.target.value }
                                  : b
                              );
                              setBanners(updatedBanners);
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor={`cta-${banner.id}`}>
                            Call to Action
                          </label>
                          <Input
                            id={`cta-${banner.id}`}
                            placeholder="Call to Action"
                            className="mt-1"
                            value={banner.cta}
                            onChange={(e) => {
                              const updatedBanners = banners.map((b) =>
                                b.id === banner.id
                                  ? { ...b, cta: e.target.value }
                                  : b
                              );
                              setBanners(updatedBanners);
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor={`link-${banner.id}`}>Link</label>
                          <Input
                            id={`link-${banner.id}`}
                            placeholder="/"
                            className="mt-1"
                            value={banner.link}
                            onChange={(e) => {
                              const updatedBanners = banners.map((b) =>
                                b.id === banner.id
                                  ? { ...b, link: e.target.value }
                                  : b
                              );
                              setBanners(updatedBanners);
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor={`position-${banner.id}`}>
                            Call to Action Position
                          </label>
                          <Select
                            defaultValue={banner.position}
                            onValueChange={(value) => {
                              const updatedBanners = banners.map((b) =>
                                b.id === banner.id
                                  ? { ...b, position: value }
                                  : b
                              );
                              setBanners(updatedBanners);
                            }}
                          >
                            <SelectTrigger
                              id={`position-${banner.id}`}
                              className="mt-1"
                            >
                              <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Empty state message when no banners
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    No banners yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a banner for your homepage.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={addBanner}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add your first banner
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logo & Colors */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border shadow-sm">
            <h2 className="border-b p-4 text-lg font-medium">
              Logo & Color Palette
            </h2>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 font-medium">Logo</h3>
                  <div className="flex flex-col">
                    <div className="flex h-32 w-32 items-center justify-center rounded-md border p-4 mb-3">
                      <div className="relative h-24 w-24">
                        <Image
                          src={logoSrc}
                          alt="Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogoChange}
                      className="w-32"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Change Logo
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 font-medium">Colors</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="primary-color">Primary Color</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <div
                            className="h-6 w-6 rounded-md border-1"
                            style={{ backgroundColor: primaryColor }}
                          ></div>
                          <Input
                            id="primary-color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="tertiary-color">Tertiary Color</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <div
                            className="h-6 w-6 rounded-md border-1"
                            style={{ backgroundColor: tertiaryColor }}
                          ></div>
                          <Input
                            id="tertiary-color"
                            value={tertiaryColor}
                            onChange={(e) => setTertiaryColor(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="secondary-color">Secondary Color</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <div
                            className="h-6 w-6 rounded-md border-1"
                            style={{ backgroundColor: secondaryColor }}
                          ></div>
                          <Input
                            id="secondary-color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="background-color">
                          Background Color
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <div
                            className="h-6 w-6 rounded-md border-1"
                            style={{ backgroundColor: backgroundColor }}
                          ></div>
                          <Input
                            id="background-color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border shadow-sm">
            <h2 className="border-b p-4 text-lg font-medium">
              Call to Action Button
            </h2>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cta-text">CTA Text</label>
                    <Input
                      id="cta-text"
                      placeholder="Leave empty for default value"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="cta-fixed">Fixed CTA</label>
                    <Select defaultValue="active">
                      <SelectTrigger id="cta-fixed" className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Enabled</SelectItem>
                        <SelectItem value="inactive">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cta-text-color">CTA Text Color</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <div
                        className="h-6 w-6 rounded-md border-1"
                        style={{ backgroundColor: ctaTextColor }}
                      ></div>
                      <Input
                        id="cta-text-color"
                        value={ctaTextColor}
                        onChange={(e) => setCtaTextColor(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cta-bg-color">CTA Color</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <div
                        className="h-6 w-6 rounded-md border-1"
                        style={{ backgroundColor: ctaBgColor }}
                      ></div>
                      <Input
                        id="cta-bg-color"
                        value={ctaBgColor}
                        onChange={(e) => setCtaBgColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Parameters */}
        <div className="rounded-lg border shadow-sm">
          <h2 className="border-b p-4 text-lg font-medium">
            Additional Settings
          </h2>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="header-text">Header Text</label>
                <Input
                  id="header-text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="sticky-header" className="cursor-pointer">
                    Sticky Header
                  </label>
                  <Switch id="sticky-header" />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="fixed-nav" className="cursor-pointer">
                    Fixed Navigation Bar
                  </label>
                  <Switch id="fixed-nav" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="button-quantity" className="cursor-pointer">
                    Button Quantity
                  </label>
                  <Switch id="button-quantity" />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="search-bar" className="cursor-pointer">
                    Show Search Bar
                  </label>
                  <Switch id="search-bar" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
