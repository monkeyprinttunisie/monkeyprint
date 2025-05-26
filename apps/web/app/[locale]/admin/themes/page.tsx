"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ExternalLink, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { getCurrentUserStoreId } from "@/actions/productActions";
import {
  getStoreById,
  updateStore,
  updateUser,
  updateStoreBanners,
} from "@/actions/storeActions";
import { getCurrentUser } from "@/actions/authActions";
import FileUploader from "@/components/FileUploader";

interface HomeBannerType {
  id: string;
  imageUrl: string | null;
  title: string | null;
  titleColor: string | null;
  description: string | null;
  descriptionColor: string | null;
  backgroundColor: string | null;
  buttonId: string | null;
  button?: {
    id: string;
    buttonText: string;
    buttonLink: string;
    textColor: string;
    backgroundColor: string;
    borderColor: string;
  } | null;
}
interface BannerState {
  // HomeBanner fields
  id: string;
  imageUrl?: string | null;
  title?: string;
  titleColor?: string;
  description?: string;
  descriptionColor?: string;
  backgroundColor?: string | null;

  // Button fields
  buttonText: string;
  buttonLink: string;
  textColor: string;
  buttonBackgroundColor: string;
  borderColor?: string;
}

export default function ThemeConfigPage() {
  const [selectedTheme, setSelectedTheme] = useState("theme1");
  const [bannersExpanded, setBannersExpanded] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#f5c242");
  const [tertiaryColor, setTertiaryColor] = useState("#f5c242");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [ctaTextColor, setCtaTextColor] = useState("#FFFFFF");
  const [ctaBgColor, setCtaBgColor] = useState("#2563eb");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [currentEditingBannerId, setCurrentEditingBannerId] = useState<
    string | null
  >(null);

  const [banners, setBanners] = useState<BannerState[]>([
    {
      id: "banner-1",
      imageUrl: null,
      title: "",
      titleColor: "#000000",
      description: "",
      descriptionColor: "#000000",
      backgroundColor: "center",
      buttonText: "Order Now",
      buttonLink: "/",
      textColor: "#FFFFFF",
      buttonBackgroundColor: "#2563eb",
      borderColor: "transparent",
    },
  ]);
  const [storeData, setStoreData] = useState({
    name: "",
    imageUrl: "",
  });

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setIsLoading(true);

        // Get the current user's store ID
        const storeId = await getCurrentUserStoreId();
        if (!storeId) {
          console.error("No store ID found for current user");
          return;
        }

        //save storeId
        setStoreId(storeId);

        // Get store details
        const storeDetails = await getStoreById(storeId);

        // Get user details
        const userData = await getCurrentUser();

        if (storeDetails && userData) {
          setUserId(userData.id);
          setStoreData({
            ...storeData,
            name: storeDetails.name || "",
            imageUrl: storeDetails.image || "",
          });
        }

        // load existing banners
        const existingBanners = storeDetails?.homeBanner || [];

        if (existingBanners.length > 0) {
          const formattedBanners = existingBanners.map(
            (banner: HomeBannerType): BannerState => ({
              id: banner.id,
              imageUrl: banner.imageUrl,
              title: banner.title || "",
              titleColor: banner.titleColor || "#ffffff",
              description: banner.description || "",
              descriptionColor: banner.descriptionColor || "#ffffff",
              backgroundColor: banner.backgroundColor,
              buttonText: banner.button?.buttonText || "Order Now",
              buttonLink: banner.button?.buttonLink || "/",
              textColor: banner.button?.textColor || "#FFFFFF",
              buttonBackgroundColor:
                banner.button?.backgroundColor || "#2563eb",
              borderColor: banner.button?.borderColor || "transparent",
            })
          );

          setBanners(formattedBanners);
        }
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreData();
  }, []);

  //banner functions
  const deleteBanner = (bannerId: string) => {
    setBanners(banners.filter((banner) => banner.id !== bannerId));
  };

  const addBanner = () => {
    const newBanner = {
      id: `banner-${banners.length + 1}-${Date.now()}`,
      imageUrl: "",
      title: "",
      titleColor: "#000000",
      description: "",
      descriptionColor: "#000000",
      backgroundColor: "transparent",
      buttonText: "Order Now",
      buttonLink: "/",
      textColor: ctaTextColor,
      buttonBackgroundColor: ctaBgColor,
      borderColor: "transparent",
    };
    setBanners([...banners, newBanner]);
  };

  const handleUploadComplete = (res: any[]) => {
    if (res.length > 0 && currentEditingBannerId) {
      console.log("Upload response:", res);
      const uploadedImageUrl = res[0].url || res[0].ufsUrl || "";

      if (!uploadedImageUrl) {
        toast.error("Failed to get uploaded image URL");
        return;
      }

      const updatedBanners = banners.map((b) =>
        b.id === currentEditingBannerId
          ? { ...b, imageUrl: uploadedImageUrl }
          : b
      );

      setBanners(updatedBanners);
      setCurrentEditingBannerId(null);
      toast.success("Image uploaded and banner updated!");
    }
  };

  const handleSaveChanges = async () => {
    if (!storeId) {
      toast.error("Store ID not found. Please refresh the page.");
      return;
    }

    setIsSaving(true);

    try {
      console.log("Saving banners:", banners);

      // Save banners
      const bannersResult = await updateStoreBanners(storeId, banners);

      if (storeData.imageUrl) {
        const userUpdateResult = await updateUser(userId, {
          image: storeData.imageUrl,
        });

        if (!userUpdateResult.success) {
          toast.error("Failed to save logo");
          console.error("Logo save error:", userUpdateResult);
        }
      }

      if (bannersResult.success) {
        toast.success("Theme settings saved successfully!");
      } else {
        toast.error(bannersResult.message || "Failed to save changes");
        console.error("Save error:", bannersResult);
      }
    } catch (error) {
      toast.error("An error occurred while saving changes");
      console.error("Error saving theme settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  //colors functions
  const handleLogoChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleImageChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
          <h1 className="text-xl font-semibold">Theme Settings</h1>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveChanges}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
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

              {/* Theme 2 - Coming Soon */}
              <div
                className="flex-shrink-0 w-[280px] transition-all duration-200 snap-center relative cursor-not-allowed"
                onMouseEnter={() => setHoveredCard("theme2")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 z-10 overflow-hidden">
                  <div className="absolute -left-12 top-6 z-10 -rotate-45 transform bg-gradient-to-r from-blue-700 to-blue-500 py-1.5 px-12 text-center shadow-lg">
                    <span className="font-semibold text-white tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <Card
                  className={`overflow-hidden mx-1 my-1 py-1 relative grayscale opacity-75`}
                >
                  <div className="p-4 pb-10 blur-[1px]">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                      <Image
                        src="/images/template-3.jpg"
                        alt="Theme Modern"
                        width={400}
                        height={300}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium -mt-5">Modern</h3>
                    </div>

                    <div className="absolute bottom-2 left-4 right-4 h-8">
                      <p className="text-sm text-muted-foreground absolute inset-0">
                        A modern, sleek design with vibrant accents.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Theme 3 - Coming Soon */}
              <div
                className="flex-shrink-0 w-[280px] transition-all duration-200 snap-center relative cursor-not-allowed"
                onMouseEnter={() => setHoveredCard("theme3")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 z-10 overflow-hidden">
                  <div className="absolute -left-12 top-6 z-10 -rotate-45 transform bg-gradient-to-r from-blue-700 to-blue-500 py-1.5 px-12 text-center shadow-lg">
                    <span className="font-semibold text-white tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <Card
                  className={`overflow-hidden mx-1 my-1 py-1 relative grayscale opacity-75`}
                >
                  <div className="p-4 pb-10 blur-[1px]">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                      <Image
                        src="/images/template-3.jpg"
                        alt="Theme Premium"
                        width={400}
                        height={300}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium -mt-5">Premium</h3>
                    </div>

                    <div className="absolute bottom-2 left-4 right-4 h-8">
                      <p className="text-sm text-muted-foreground absolute inset-0">
                        A luxury design with premium visual elements.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Visual indicator for more content (right shadow) */}
            <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white/80 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Logo & Colors */}
        <div className="grid grid-cols-1 gap-6 ">
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
                      <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                        {storeData.imageUrl ? (
                          <Image
                            src={storeData.imageUrl}
                            alt="Logo"
                            fill
                            sizes="(max-width: 768px) 96px, 96px"
                            className="object-cover"
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="36"
                              height="36"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-gray-400"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                    />
                    <FileUploader
                      handleUploadComplete={(res) => {
                        if (res.length > 0) {
                          console.log("Logo upload response:", res);
                          const uploadedImageUrl =
                            res[0].url || res[0].ufsUrl || "";

                          if (!uploadedImageUrl) {
                            toast.error("Failed to get uploaded logo URL");
                            return;
                          }

                          // Update store data with new logo URL
                          setStoreData({
                            ...storeData,
                            imageUrl: uploadedImageUrl,
                          });

                          toast.success("Logo uploaded successfully!");
                        }
                      }}
                    />
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
                      {/* Left column with banner image preview */}
                      <div className="md:col-span-1">
                        <h3 className="mb-4 font-medium">Image</h3>
                        <div className="aspect-video overflow-hidden rounded-md mb-4">
                          {banner.imageUrl ? (
                            // Show uploaded image when available
                            <div className="relative w-full h-full">
                              <Image
                                src={banner.imageUrl}
                                alt={banner.title || "Banner"}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center ">
                                <p
                                  className="text-center text-sm font-semibold"
                                  style={{ color: banner.titleColor }}
                                >
                                  {banner.title}
                                </p>
                                <p
                                  className="text-center text-sm"
                                  style={{ color: banner.descriptionColor }}
                                >
                                  {banner.description}
                                </p>
                                <button
                                  className="mt-2 rounded-md px-4 py-1 text-xs"
                                  style={{
                                    backgroundColor:
                                      banner.buttonBackgroundColor,
                                    color: banner.textColor,
                                  }}
                                >
                                  {banner.buttonText || "Order Now"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Default blue background when no image
                            <div className="bg-blue-600 flex h-full flex-col items-center justify-center text-white">
                              <p className="text-center text-sm">
                                {banner.title || "Place your banner"}
                              </p>
                              <p className="text-center text-sm">
                                {banner.description || "image here"}
                              </p>
                              <button
                                className="mt-2 rounded-md px-4 py-1 text-xs"
                                style={{
                                  backgroundColor: banner.buttonBackgroundColor,
                                  color: banner.textColor,
                                }}
                              >
                                {banner.buttonText || "Order Now"}
                              </button>
                            </div>
                          )}
                        </div>
                        <FileUploader
                          handleUploadComplete={(res) => {
                            setCurrentEditingBannerId(banner.id);
                            handleUploadComplete(res);
                          }}
                          buttonText="Change Background"
                        />
                      </div>

                      {/* Right column with banner content settings */}
                      <div className="space-y-4 md:col-span-2">
                        <div className="grid grid-cols-2 gap-4">
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
                            <label htmlFor={`title-color-${banner.id}`}>
                              Title Color
                            </label>
                            <div className="mt-1 flex items-center space-x-2">
                              <div
                                className="h-6 w-6 rounded-md border-1"
                                style={{
                                  backgroundColor: banner.titleColor,
                                }}
                              ></div>
                              <Input
                                id={`title-color-${banner.id}`}
                                value={banner.titleColor}
                                onChange={(e) => {
                                  const updatedBanners = banners.map((b) =>
                                    b.id === banner.id
                                      ? {
                                          ...b,
                                          titleColor: e.target.value,
                                        }
                                      : b
                                  );
                                  setBanners(updatedBanners);
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                            <label htmlFor={`description-color-${banner.id}`}>
                              Description Color
                            </label>
                            <div className="mt-1 flex items-center space-x-2">
                              <div
                                className="h-6 w-6 rounded-md border-1"
                                style={{
                                  backgroundColor: banner.descriptionColor,
                                }}
                              ></div>
                              <Input
                                id={`description-color-${banner.id}`}
                                value={banner.descriptionColor}
                                onChange={(e) => {
                                  const updatedBanners = banners.map((b) =>
                                    b.id === banner.id
                                      ? {
                                          ...b,
                                          descriptionColor: e.target.value,
                                        }
                                      : b
                                  );
                                  setBanners(updatedBanners);
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ADDED: Call to Action section */}
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-medium mb-3">
                            Call to Action Button
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor={`cta-${banner.id}`}>
                                Button Text
                              </label>
                              <Input
                                id={`cta-${banner.id}`}
                                placeholder="Call to Action"
                                className="mt-1"
                                value={banner.buttonText}
                                onChange={(e) => {
                                  const updatedBanners = banners.map((b) =>
                                    b.id === banner.id
                                      ? { ...b, buttonText: e.target.value }
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
                                value={banner.buttonLink}
                                onChange={(e) => {
                                  const updatedBanners = banners.map((b) =>
                                    b.id === banner.id
                                      ? { ...b, buttonLink: e.target.value }
                                      : b
                                  );
                                  setBanners(updatedBanners);
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <label htmlFor={`cta-text-color-${banner.id}`}>
                                Text Color
                              </label>
                              <div className="mt-1 flex items-center space-x-2">
                                <div
                                  className="h-6 w-6 rounded-md border-1"
                                  style={{
                                    backgroundColor: banner.textColor,
                                  }}
                                ></div>
                                <Input
                                  id={`cta-text-color-${banner.id}`}
                                  value={banner.textColor}
                                  onChange={(e) => {
                                    const updatedBanners = banners.map((b) =>
                                      b.id === banner.id
                                        ? { ...b, textColor: e.target.value }
                                        : b
                                    );
                                    setBanners(updatedBanners);
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor={`cta-bg-color-${banner.id}`}>
                                Button Background Color
                              </label>
                              <div className="mt-1 flex items-center space-x-2">
                                <div
                                  className="h-6 w-6 rounded-md border-1"
                                  style={{
                                    backgroundColor:
                                      banner.buttonBackgroundColor,
                                  }}
                                ></div>
                                <Input
                                  id={`cta-bg-color-${banner.id}`}
                                  value={banner.buttonBackgroundColor}
                                  onChange={(e) => {
                                    const updatedBanners = banners.map((b) =>
                                      b.id === banner.id
                                        ? {
                                            ...b,
                                            buttonBackgroundColor:
                                              e.target.value,
                                          }
                                        : b
                                    );
                                    setBanners(updatedBanners);
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/*                           <div className="mt-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`fixed-cta-${banner.id}`}
                                checked={banner.isFixed}
                                onChange={(e) => {
                                  const updatedBanners = banners.map((b) =>
                                    b.id === banner.id
                                      ? { ...b, isFixed: e.target.checked }
                                      : b
                                  );
                                  setBanners(updatedBanners);
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <label
                                htmlFor={`fixed-cta-${banner.id}`}
                                className="text-sm"
                              >
                                Show floating button on mobile
                              </label>
                            </div>
                          </div> */}
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
      </div>
    </div>
  );
}
