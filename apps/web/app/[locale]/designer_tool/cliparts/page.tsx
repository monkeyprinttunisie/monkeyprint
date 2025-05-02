"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import useClipartStore from "@/store/clipartStore"
import { useTranslations } from "next-intl"

export default function ClipartsPage() {
  const t = useTranslations("ClipartPage")
  const { cliparts, selectedClipartIds, toggleSelectClipart, getSelectedCliparts } = useClipartStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")

  useEffect(() => {
    if (productId) {
      localStorage.setItem("selectedProduct", productId)
    }
  }, [productId])

  // Get unique categories from cliparts
  const categories = Array.from(new Set(cliparts.map((clipart) => clipart.category)))

  // Filter cliparts based on search query and selected category
  const filteredCliparts = cliparts.filter((clipart) => {
    const matchesSearch = searchQuery === "" || clipart.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === null || clipart.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleApplyClick = () => {
    if (!productId && !localStorage.getItem("selectedProduct")) {
      alert("Please select a product first")
      return
    }

    if (selectedClipartIds.length === 0) {
      alert("Please select at least one clipart")
      return
    }

    try {
      // Get selected cliparts
      const selectedCliparts = getSelectedCliparts()

      localStorage.setItem("selectedImages", JSON.stringify(selectedCliparts.map((c) => c.imageUrl)))

      localStorage.setItem("createNewDesign", "false")

      localStorage.setItem("activeNavLink", "products")

      // Dispatch storage event to notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"))
      }

      // Navigate to preview with the first selected image as parameter
      const targetProduct = productId || localStorage.getItem("selectedProduct")
      router.push(
        `/designer_tool/previewProduct?product=${targetProduct}&image=${encodeURIComponent(selectedCliparts[0].imageUrl)}`,
      )
    } catch (error) {
      console.error("Error applying selected cliparts:", error)
      alert("An error occurred while applying your selection. Please try again.")
    }
  }

  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen">
      <div className="w-full max-w-md px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-600 text-center">{t("title")}</h1>

        {/* Search bar */}
        <div className="relative mb-6">
          <div className="flex items-center bg-blue-50 rounded-full px-6 py-3">
            <input
              type="text"
              placeholder={t("search")}
              className="flex-grow bg-transparent outline-none text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <button
            className="text-blue-500 font-medium flex items-center w-full justify-between"
            onClick={() => setShowCategories(!showCategories)}
          >
            <span>{selectedCategory ? t(selectedCategory.toLowerCase()) : t("all_categories")}</span>
            <ChevronRight className={`h-5 w-5 transition-transform ${showCategories ? "rotate-90" : ""}`} />
          </button>

          {showCategories && (
            <div className="mt-2 bg-white rounded-lg shadow-sm p-2 space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded ${selectedCategory === null ? "bg-blue-50 text-blue-500" : ""}`}
                onClick={() => {
                  setSelectedCategory(null)
                  setShowCategories(false)
                }}
              >
                {t("all_categories")}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`w-full text-left px-3 py-2 rounded ${selectedCategory === category ? "bg-blue-50 text-blue-500" : ""}`}
                  onClick={() => {
                    setSelectedCategory(category)
                    setShowCategories(false)
                  }}
                >
                  {t(category.toLowerCase())}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clipart grid */}
        {filteredCliparts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 w-full mb-24">
            {filteredCliparts.map((clipart) => (
              <div
                key={clipart.id}
                className="cursor-pointer relative group bg-white p-2 rounded-lg shadow-md"
                onClick={() => toggleSelectClipart(clipart.id)}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md">
                  <Image
                    src={clipart.imageUrl || "/placeholder.svg"}
                    alt={`Clipart ${clipart.id}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain transition-all duration-300"
                    style={{ objectFit: "contain" }}
                  />

                  {/* Darker overlay for selected image */}
                  <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300
                    ${selectedClipartIds.includes(clipart.id) ? "opacity-30" : "opacity-0 group-hover:opacity-10"}`}
                  ></div>

                  {/* Checkmark for selected image */}
                  {selectedClipartIds.includes(clipart.id) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* FREE label */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2">
                    <span className="bg-blue-100 text-blue-500 px-4 py-1 rounded-full text-xs font-medium">
                      {t("free")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">{t("no_cliparts")}</p>
          </div>
        )}

        {/* Apply button  */}
        {filteredCliparts.length > 0 && (
          <div className="fixed bottom-15 left-0 right-0 flex justify-center p-6 z-10">
            <button
              onClick={handleApplyClick}
              disabled={selectedClipartIds.length === 0}
              className={`py-2 px-6 rounded-full text-white font-medium shadow-lg transition-all
              ${selectedClipartIds.length !== 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
            >
              {t("apply")} {selectedClipartIds.length > 0 ? `(${selectedClipartIds.length})` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
