"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  SlidersHorizontal,
  Grid3x3,
  List,
  Sparkles,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"

interface GoldSale {
  id: number
  gold_type: string
  weight_grams: number
  purity_percentage: number
  price_per_gram: number
  total_amount: number
  currency: string
  description: string | null
  status: string
  notes: string | null
  image_url: string | null
  images: string[] | null
  created_at: string
  updated_at: string
  promotions: number | null
  subcategory: string
  category_id: number | null // Added category_id field
  subcategory_id: number | null
}

interface GoldCategory {
  id: number
  name: string
  slug: string
  sort_order: number
  parent_id: number | null
}

export default function GoldPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  const [goldItems, setGoldItems] = useState<GoldSale[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const [selectedParentCategory, setSelectedParentCategory] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [goldTypeFilter, setGoldTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState([0, 35000000])
  const [weightRange, setWeightRange] = useState([0, 250000])
  const [purityFilter, setPurityFilter] = useState("all")
  const [sortDialogOpen, setSortDialogOpen] = useState(false)
  const [tempSortBy, setTempSortBy] = useState(sortBy)
  const [isSticky, setIsSticky] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Refs used to remember the listing position (page + scroll) across product visits
  const currentPageRef = useRef(currentPage)
  const initialLoadDone = useRef(false)
  const didRestore = useRef(false)
  const listStateKey = `gold-list-state:${categoryParam ?? "all"}`

  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  const persistListState = useCallback(() => {
    // Only start persisting once we've restored any previously saved position,
    // so an early scroll/render can't overwrite it before we read it back.
    if (!initialLoadDone.current) return
    try {
      sessionStorage.setItem(
        listStateKey,
        JSON.stringify({ page: currentPageRef.current, scrollY: window.scrollY }),
      )
    } catch {
      // Ignore storage errors (e.g. private mode)
    }
  }, [listStateKey])

  const [goldCategories, setGoldCategories] = useState<GoldCategory[]>([])
  const [goldSubcategories, setGoldSubcategories] = useState<{ id: string; label: string }[]>([])

  // Filter section collapse states
  const [goldTypeFilterOpen, setGoldTypeFilterOpen] = useState(true)
  const [priceFilterOpen, setPriceFilterOpen] = useState(true)
  const [weightFilterOpen, setWeightFilterOpen] = useState(true)
  const [purityFilterOpen, setPurityFilterOpen] = useState(true)

  // Dual currency price inputs
  const [minPriceBGN, setMinPriceBGN] = useState("")
  const [maxPriceBGN, setMaxPriceBGN] = useState("")
  const [minPriceEUR, setMinPriceEUR] = useState("")
  const [maxPriceEUR, setMaxPriceEUR] = useState("")

  // Weight inputs
  const [minWeight, setMinWeight] = useState("")
  const [maxWeight, setMaxWeight] = useState("")

  // EUR to BGN exchange rate
  const EUR_TO_BGN = 1.9558

  // Category banner state
  const [categoryBanner, setCategoryBanner] = useState<{
    id: number
    image_url: string
    mobile_image_url?: string
    link_url?: string
    link_text?: string
    title?: string
    subtitle?: string
  } | null>(null)

  // Category info for breadcrumbs
  const [categoryInfo, setCategoryInfo] = useState<{
    name: string
    parentName?: string
    parentId?: number
  } | null>(null)

  useEffect(() => {
    fetchGold()
    fetchGoldCategories()
    fetchCategoryBanner()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsSticky(scrollPosition > 100)
      persistListState()
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [persistListState])

  const fetchCategoryBanner = async () => {
    try {
      const response = await fetch("/api/category-banners?category_type=gold")
      if (response.ok) {
        const data = await response.json()
        if (data && data.image_url) {
          setCategoryBanner(data)
        } else {
          // Use static default banner if no database banner exists
          setCategoryBanner({
            id: 0,
            image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images%20%2899%29-l6ymgIf8VrwozO8ldsszndnVrjtV9k.jpeg",
            link_url: "#",
            title: "Злато - специални оферти"
          })
        }
      } else {
        // Use static default banner on error
        setCategoryBanner({
          id: 0,
          image_url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1400&h=400&fit=crop&crop=center",
          link_url: "#",
          title: "Злато - специални оферти"
        })
      }
    } catch (error) {
      console.error("Error fetching category banner:", error)
      // Use static default banner on error
      setCategoryBanner({
        id: 0,
        image_url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1400&h=400&fit=crop&crop=center",
        link_url: "#",
        title: "Злато - специални оферти"
      })
    }
  }

  const fetchGold = async () => {
    try {
      const response = await fetch("/api/gold")
      if (!response.ok) throw new Error("Failed to fetch gold sales")
      const data = await response.json()
      setGoldItems(data)
    } catch (error) {
      console.error("Error fetching gold sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGoldCategories = async () => {
    try {
      const response = await fetch("/api/gold-categories")
      if (!response.ok) throw new Error("Failed to fetch gold categories")
      const data: GoldCategory[] = await response.json()
      setGoldCategories(data)

      console.log("[v0] Gold categories fetched:", data)
      console.log("[v0] URL category param:", categoryParam)

      // Build subcategories list based on whether we have a parent category selected
      updateSubcategoriesList(data, null, categoryParam)
    } catch (error) {
      console.error("Error fetching gold categories:", error)
    }
  }

  const updateSubcategoriesList = (categories: GoldCategory[], parentId: number | null, urlParam: string | null) => {
    console.log("[v0] updateSubcategoriesList called with:", { parentId, urlParam, categoriesCount: categories.length })
    console.log(
      "[v0] All categories:",
      categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parent_id: c.parent_id })),
    )

    // Find if URL param matches a category
    let matchedParent: GoldCategory | undefined
    let matchedCategory: GoldCategory | undefined

    if (urlParam) {
      matchedCategory = categories.find((cat) => cat.slug === urlParam)
      console.log("[v0] Matched category by slug:", matchedCategory)

      if (matchedCategory) {
        // Check if it's a parent category (has children)
        const hasChildren = categories.some((cat) => cat.parent_id === matchedCategory!.id)
        console.log("[v0] Matched category has children:", hasChildren)

        if (hasChildren || matchedCategory.parent_id === null) {
          // It's a parent category
          matchedParent = matchedCategory
        } else if (matchedCategory.parent_id) {
          // It's a child category, find its parent
          matchedParent = categories.find((cat) => cat.id === matchedCategory!.parent_id)
        }
      }
    }

    const effectiveParentId = matchedParent?.id || parentId
    console.log("[v0] Effective parent ID:", effectiveParentId, "Parent name:", matchedParent?.name)

    if (effectiveParentId) {
      // Show child categories of the selected parent
      const childCategories = categories.filter((cat) => cat.parent_id === effectiveParentId)
      console.log("[v0] Child categories found:", childCategories)

      const subcatList = [
        { id: "all", label: "ВСИЧКИ" },
        ...childCategories.map((cat) => ({ id: String(cat.id), label: cat.name.toUpperCase() })),
      ]
      console.log("[v0] Setting goldSubcategories to:", subcatList)
      setGoldSubcategories(subcatList)
      setSelectedParentCategory(effectiveParentId)

      // If the URL matches a child category, select it
      if (matchedCategory && matchedCategory.parent_id === effectiveParentId) {
        setSelectedSubcategory(String(matchedCategory.id))
      } else {
        setSelectedSubcategory("all")
      }
    } else {
      // Show only parent categories (no parent_id)
      const parentCategories = categories.filter((cat) => cat.parent_id === null)
      console.log("[v0] Parent categories (no parent_id):", parentCategories)

      const subcatList = [
        { id: "all", label: "ВСИЧКИ" },
        ...parentCategories.map((cat) => ({ id: String(cat.id), label: cat.name.toUpperCase() })),
      ]
      console.log("[v0] Setting goldSubcategories to:", subcatList)
      setGoldSubcategories(subcatList)
      setSelectedParentCategory(null)

      if (matchedCategory && !matchedCategory.parent_id) {
        setSelectedSubcategory(String(matchedCategory.id))
      }
    }
  }

  useEffect(() => {
    if (goldCategories.length > 0) {
      updateSubcategoriesList(goldCategories, null, categoryParam)
    }
  }, [categoryParam, goldCategories])

  useEffect(() => {
    // Don't reset while restoring the saved position on initial load;
    // only reset to page 1 when the user actually changes a filter afterwards.
    if (!initialLoadDone.current) return
    setCurrentPage(1)
  }, [
    goldTypeFilter,
    sortBy,
    priceRange,
    weightRange,
    purityFilter,
    searchTerm,
    selectedSubcategory,
    selectedParentCategory,
  ])

  // Restore the saved page + scroll position when returning to this listing
  // (e.g. after viewing a product and pressing back).
  useEffect(() => {
    if (didRestore.current) return
    if (loading) return
    if (goldCategories.length === 0) return
    didRestore.current = true

    let savedScrollY = 0
    try {
      const raw = sessionStorage.getItem(listStateKey)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved?.page && saved.page > 1) setCurrentPage(saved.page)
        savedScrollY = saved?.scrollY || 0
      }
    } catch {
      // Ignore storage errors
    }

    initialLoadDone.current = true

    if (savedScrollY > 0) {
      const restoreScroll = () => window.scrollTo(0, savedScrollY)
      requestAnimationFrame(() => requestAnimationFrame(restoreScroll))
      // Fallbacks for late layout shifts (e.g. product images loading in)
      setTimeout(restoreScroll, 150)
      setTimeout(restoreScroll, 400)
    }
  }, [loading, goldCategories, listStateKey])

  // Persist page changes so returning to the listing resumes on the same page.
  useEffect(() => {
    persistListState()
  }, [currentPage, persistListState])

  const goldTypes = Array.from(new Set(goldItems.map((item) => item.gold_type))).filter(Boolean)

  // Calculate price histogram data
  const priceHistogram = useMemo(() => {
    if (goldItems.length === 0) return { buckets: [], minPrice: 0, maxPrice: 35000000 }
    
    const prices = goldItems.map((item) => Number(item.price_per_gram) * Number(item.weight_grams))
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const bucketCount = 8
    const bucketSize = (maxPrice - minPrice) / bucketCount
    
    const buckets = Array(bucketCount).fill(0)
    prices.forEach((price) => {
      const bucketIndex = Math.min(
        Math.floor((price - minPrice) / bucketSize),
        bucketCount - 1
      )
      buckets[bucketIndex]++
    })
    
    const maxBucketCount = Math.max(...buckets)
    const normalizedBuckets = buckets.map((count) => 
      maxBucketCount > 0 ? (count / maxBucketCount) * 100 : 0
    )
    
    return { buckets: normalizedBuckets, minPrice, maxPrice }
  }, [goldItems])

  // Calculate weight histogram data
  const weightHistogram = useMemo(() => {
    if (goldItems.length === 0) return { buckets: [], minWeight: 0, maxWeight: 250000 }
    
    const weights = goldItems.map((item) => Number(item.weight_grams))
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const bucketCount = 8
    const bucketSize = (maxWeight - minWeight) / bucketCount
    
    const buckets = Array(bucketCount).fill(0)
    weights.forEach((weight) => {
      const bucketIndex = Math.min(
        Math.floor((weight - minWeight) / bucketSize),
        bucketCount - 1
      )
      buckets[bucketIndex]++
    })
    
    const maxBucketCount = Math.max(...buckets)
    const normalizedBuckets = buckets.map((count) => 
      maxBucketCount > 0 ? (count / maxBucketCount) * 100 : 0
    )
    
    return { buckets: normalizedBuckets, minWeight, maxWeight }
  }, [goldItems])

  // Update price range when inputs change
  const handlePriceInputChange = (type: 'min' | 'max', currency: 'BGN' | 'EUR', value: string) => {
    const numValue = parseFloat(value) || 0
    
    if (currency === 'BGN') {
      if (type === 'min') {
        setMinPriceBGN(value)
        setMinPriceEUR((numValue / EUR_TO_BGN).toFixed(0))
        setPriceRange([numValue / EUR_TO_BGN, priceRange[1]])
      } else {
        setMaxPriceBGN(value)
        setMaxPriceEUR((numValue / EUR_TO_BGN).toFixed(0))
        setPriceRange([priceRange[0], numValue / EUR_TO_BGN])
      }
    } else {
      if (type === 'min') {
        setMinPriceEUR(value)
        setMinPriceBGN((numValue * EUR_TO_BGN).toFixed(0))
        setPriceRange([numValue, priceRange[1]])
      } else {
        setMaxPriceEUR(value)
        setMaxPriceBGN((numValue * EUR_TO_BGN).toFixed(0))
        setPriceRange([priceRange[0], numValue])
      }
    }
  }

  // Update weight range when inputs change
  const handleWeightInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0
    if (type === 'min') {
      setMinWeight(value)
      setWeightRange([numValue, weightRange[1]])
    } else {
      setMaxWeight(value)
      setWeightRange([weightRange[0], numValue])
    }
  }

  const filteredGold = goldItems
    .filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.gold_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = goldTypeFilter === "all" || item.gold_type === goldTypeFilter

      const itemPrice = Number(item.price_per_gram) * Number(item.weight_grams)
      const matchesPrice = itemPrice >= priceRange[0] && itemPrice <= priceRange[1]

      const matchesWeight = Number(item.weight_grams) >= weightRange[0] && Number(item.weight_grams) <= weightRange[1]

      let matchesPurity = true
      const purity = Number(item.purity_percentage)
      if (purityFilter === "high") matchesPurity = purity >= 90
      else if (purityFilter === "medium") matchesPurity = purity >= 75 && purity < 90
      else if (purityFilter === "low") matchesPurity = purity < 75

      let matchesCategory = true
      if (selectedSubcategory !== "all") {
        // When a specific subcategory is selected, filter by subcategory_id
        matchesCategory = item.subcategory_id === Number.parseInt(selectedSubcategory)
      } else if (selectedParentCategory) {
        // When "all" is selected but we have a parent, show items from all child categories
        const childCategoryIds = goldCategories
          .filter((cat) => cat.parent_id === selectedParentCategory)
          .map((cat) => cat.id)
        // Show items that belong to this parent category or any of its child subcategories
        matchesCategory =
          item.category_id === selectedParentCategory ||
          (item.subcategory_id !== null && childCategoryIds.includes(item.subcategory_id))
      }

      return matchesSearch && matchesType && matchesPrice && matchesWeight && matchesPurity && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return Number(a.price_per_gram) * Number(a.weight_grams) - Number(b.price_per_gram) * Number(b.weight_grams)
        case "price_desc":
          return Number(b.price_per_gram) * Number(b.weight_grams) - Number(a.price_per_gram) * Number(a.weight_grams)
        case "weight_asc":
          return Number(a.weight_grams) - Number(b.weight_grams)
        case "weight_desc":
          return Number(b.weight_grams) - Number(a.weight_grams)
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const totalPages = Math.ceil(filteredGold.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGold = filteredGold.slice(startIndex, endIndex)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .map((pageNum) => {
      if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
        return pageNum
      }
      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
        return "..."
      }
      return null
    })
    .filter((num) => num !== null)

  const { addToCart } = useCart()
  const { addFavorite, removeFavorite, isFavorited } = useFavorites()
  const { toast } = useToast()

  const FiltersContent = () => (
    <div className="divide-y divide-gray-200">
      {/* Gold Type Filter */}
      <div className="py-4">
        <button
          onClick={() => setGoldTypeFilterOpen(!goldTypeFilterOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-bold text-base">Тип злато</h3>
          <ChevronDown
            className={`h-5 w-5 text-red-500 transition-transform ${goldTypeFilterOpen ? "rotate-180" : ""}`}
          />
        </button>
        
        {goldTypeFilterOpen && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="goldType"
                checked={goldTypeFilter === "all"}
                onChange={() => setGoldTypeFilter("all")}
                className="w-5 h-5 rounded border-gray-300 accent-red-500"
              />
              <span className="text-sm">Всички типове</span>
            </label>
            {goldTypes.map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="goldType"
                  checked={goldTypeFilter === type}
                  onChange={() => setGoldTypeFilter(type)}
                  className="w-5 h-5 rounded border-gray-300 accent-red-500"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="py-4">
        <button
          onClick={() => setPriceFilterOpen(!priceFilterOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-bold text-base">Ценова група</h3>
          <ChevronDown
            className={`h-5 w-5 text-red-500 transition-transform ${priceFilterOpen ? "rotate-180" : ""}`}
          />
        </button>
        
        {priceFilterOpen && (
          <div className="mt-4">
            {/* Price Histogram */}
            <div className="flex items-end gap-0.5 h-16 mb-3">
              {priceHistogram.buckets.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gray-400 rounded-t-sm"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              ))}
            </div>
            
            {/* Price Range Display */}
            <div className="flex justify-between text-sm mb-3">
              <span className="text-blue-600">
                {(priceHistogram.minPrice).toFixed(2)} € / {(priceHistogram.minPrice * EUR_TO_BGN).toFixed(2)} лв.
              </span>
              <span className="text-blue-600">
                {(priceHistogram.maxPrice).toFixed(2)} € / {(priceHistogram.maxPrice * EUR_TO_BGN).toFixed(2)} лв.
              </span>
            </div>
            
            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Мин.</span>
              <span>Макс.</span>
            </div>
            
            {/* Price Input Fields - BGN Row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 flex items-center border rounded overflow-hidden">
                <input
                  type="number"
                  value={minPriceBGN}
                  onChange={(e) => handlePriceInputChange('min', 'BGN', e.target.value)}
                  placeholder={Math.round(priceHistogram.minPrice * EUR_TO_BGN).toString()}
                  className="w-full px-2 py-2 text-sm outline-none text-center"
                />
                <span className="px-2 py-2 bg-white text-sm text-gray-600 border-l">лв.</span>
              </div>
              
              <span className="text-gray-400">—</span>
              
              <div className="flex-1 flex items-center border rounded overflow-hidden">
                <input
                  type="number"
                  value={maxPriceBGN}
                  onChange={(e) => handlePriceInputChange('max', 'BGN', e.target.value)}
                  placeholder={Math.round(priceHistogram.maxPrice * EUR_TO_BGN).toString()}
                  className="w-full px-2 py-2 text-sm outline-none text-center"
                />
                <span className="px-2 py-2 bg-white text-sm text-gray-600 border-l">лв.</span>
              </div>
            </div>
            
            {/* EUR Row */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center border rounded overflow-hidden">
                <input
                  type="number"
                  value={minPriceEUR}
                  onChange={(e) => handlePriceInputChange('min', 'EUR', e.target.value)}
                  placeholder={Math.round(priceHistogram.minPrice).toString()}
                  className="w-full px-2 py-2 text-sm outline-none text-center"
                />
                <span className="px-2 py-2 bg-white text-sm text-gray-600 border-l">€</span>
              </div>
              
              <span className="text-gray-400">—</span>
              
              <div className="flex-1 flex items-center border rounded overflow-hidden">
                <input
                  type="number"
                  value={maxPriceEUR}
                  onChange={(e) => handlePriceInputChange('max', 'EUR', e.target.value)}
                  placeholder={Math.round(priceHistogram.maxPrice).toString()}
                  className="w-full px-2 py-2 text-sm outline-none text-center"
                />
                <span className="px-2 py-2 bg-white text-sm text-gray-600 border-l">€</span>
              </div>
            </div>
            
            {/* Clear Price Button */}
            <button
              onClick={() => {
                setMinPriceBGN("")
                setMaxPriceBGN("")
                setMinPriceEUR("")
                setMaxPriceEUR("")
                setPriceRange([0, 35000000])
              }}
              className="w-full py-2.5 border-2 border-blue-500 rounded-full text-gray-700 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Изчисти
            </button>
          </div>
        )}
      </div>

      {/* Weight Filter */}
      <div className="py-4">
        <button
          onClick={() => setWeightFilterOpen(!weightFilterOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-bold text-base">Тегло</h3>
          <ChevronDown
            className={`h-5 w-5 text-red-500 transition-transform ${weightFilterOpen ? "rotate-180" : ""}`}
          />
        </button>
        
        {weightFilterOpen && (
          <div className="mt-4">
            {/* Weight Histogram */}
            <div className="flex items-end gap-0.5 h-16 mb-3">
              {weightHistogram.buckets.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gray-400 rounded-t-sm"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              ))}
            </div>
            
            {/* Weight Range Display */}
            <div className="flex justify-between text-sm mb-3">
              <span className="text-blue-600">
                {weightHistogram.minWeight.toFixed(2)}g
              </span>
              <span className="text-blue-600">
                {weightHistogram.maxWeight.toFixed(2)}g
              </span>
            </div>
            
            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Мин.</span>
              <span>Макс.</span>
            </div>
            
            {/* Weight Input Fields */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center border rounded overflow-hidden">
                <input
                  type="number"
                  value={minWeight}
                  onChange={(e) => handleWeightInputChange('min', e.target.value)}
                  placeholder={weightHistogram.minWeight.toFixed(0)}
                  className="w-full px-2 py-2 text-sm outline-none text-center"
                />
                <span className="px-2 py-2 bg-white text-sm text-gray-600 border-l">g</span>
              </div>
              
              <span className="text-gray-400">—</span>
              
              <div className="flex-1 flex items-center border rounded overflow-hidden">
                <input
                  type="number"
                  value={maxWeight}
                  onChange={(e) => handleWeightInputChange('max', e.target.value)}
                  placeholder={weightHistogram.maxWeight.toFixed(0)}
                  className="w-full px-2 py-2 text-sm outline-none text-center"
                />
                <span className="px-2 py-2 bg-white text-sm text-gray-600 border-l">g</span>
              </div>
            </div>
            
            {/* Clear Weight Button */}
            <button
              onClick={() => {
                setMinWeight("")
                setMaxWeight("")
                setWeightRange([0, 250000])
              }}
              className="w-full py-2.5 border-2 border-blue-500 rounded-full text-gray-700 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Изчисти
            </button>
          </div>
        )}
      </div>

      {/* Purity Filter */}
      <div className="py-4">
        <button
          onClick={() => setPurityFilterOpen(!purityFilterOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-bold text-base">Чистота</h3>
          <ChevronDown
            className={`h-5 w-5 text-red-500 transition-transform ${purityFilterOpen ? "rotate-180" : ""}`}
          />
        </button>
        
        {purityFilterOpen && (
          <div className="mt-4 space-y-3">
            {[
              { value: "all", label: "Всички" },
              { value: "high", label: "Висока (90%+)" },
              { value: "medium", label: "Средна (75-90%)" },
              { value: "low", label: "Ниска (<75%)" },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="purity"
                  checked={purityFilter === option.value}
                  onChange={() => setPurityFilter(option.value)}
                  className="w-5 h-5 rounded border-gray-300 accent-red-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      <div className="py-4">
        <Button
          onClick={() => {
            setSearchTerm("")
            setGoldTypeFilter("all")
            setMinPriceBGN("")
            setMaxPriceBGN("")
            setMinPriceEUR("")
            setMaxPriceEUR("")
            setPriceRange([0, 35000000])
            setMinWeight("")
            setMaxWeight("")
            setWeightRange([0, 250000])
            setPurityFilter("all")
            setSelectedSubcategory("all")
            setSelectedParentCategory(null)
          }}
          className="w-full"
          variant="outline"
        >
          Изчисти всички филтри
        </Button>
      </div>
    </div>
  )

  const getSortLabel = (value: string) => {
    const labels: Record<string, string> = {
      newest: "Най-нови",
      price_asc: "Цена възходящо",
      price_desc: "Цена низходящо",
      weight_asc: "Тегло възходящо",
      weight_desc: "Тегло низходящо",
    }
    return labels[value] || "Най-нови"
  }

  const handleAddToCart = (item: GoldSale, primaryImage: string) => {
    addToCart({
      id: item.id,
      name: `${item.weight_grams}g ${item.gold_type}`,
      price: Number(item.price_per_gram) * Number(item.weight_grams),
      image: primaryImage || null,
      category: item.gold_type,
      type: "gold",
      weight_grams: item.weight_grams,
      gold_type: item.gold_type,
    })
    toast({
      variant: "cart",
      title: "Успешно добавено!",
      description: `${item.weight_grams}g ${item.gold_type} беше добавено в количката.`,
    })
  }

  const handleToggleFavorite = (item: GoldSale) => {
    const isFav = isFavorited("gold", item.id)
    if (isFav) {
      removeFavorite("gold", item.id)
      toast({
        variant: "favorite",
        title: "Премахнато от харесани",
        description: `${item.weight_grams}g ${item.gold_type} беше премахнато от харесани.`,
      })
    } else {
      addFavorite({
        id: item.id,
        name: `${item.weight_grams}g ${item.gold_type}`,
        price: Number(item.price_per_gram) * Number(item.weight_grams),
        image: item.image_url || null,
        category: item.gold_type,
        type: "gold",
      })
      toast({
        variant: "favorite",
        title: "Добавено в харесани!",
        description: `${item.weight_grams}g ${item.gold_type} беше добавено в харесани.`,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Зареждане на злато...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-[#eaebee] pb-8">
        {/* Breadcrumbs - visible on all screens */}
        <div className="hidden lg:block max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Начало
            </Link>
            <span>›</span>
            <Link href="/gold" className="hover:text-foreground">
              Злато
            </Link>
            {categoryInfo?.parentName && (
              <>
                <span>›</span>
                <Link href={`/gold?category=${categoryInfo.parentId}`} className="hover:text-foreground">
                  {categoryInfo.parentName}
                </Link>
              </>
            )}
            {categoryInfo && (
              <>
                <span>›</span>
                <span className="text-foreground">{categoryInfo.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Mobile Breadcrumbs */}
        <div className="lg:hidden max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Начало
            </Link>
            <span>›</span>
            <Link href="/gold" className="hover:text-foreground">
              Злато
            </Link>
            {categoryInfo?.parentName && (
              <>
                <span>›</span>
                <Link href={`/gold?category=${categoryInfo.parentId}`} className="hover:text-foreground">
                  {categoryInfo.parentName}
                </Link>
              </>
            )}
            {categoryInfo && (
              <>
                <span>›</span>
                <span className="text-foreground">{categoryInfo.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Category Banner - visible on all screens */}
        {categoryBanner && (
          <div className="max-w-[1400px] mx-auto px-4 mb-4">
            <Link href={categoryBanner.link_url || "#"} className="block">
              <div className="relative w-full overflow-hidden shadow-sm">
                <img
                  src={categoryBanner.image_url}
                  alt={categoryBanner.title || "Promotional banner"}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Link>
          </div>
        )}

        {/* Desktop Subcategories Navigation - right after banner */}
        {goldSubcategories.length > 1 && (
          <div className="hidden lg:block max-w-[1400px] mx-auto px-4 mb-4">
            <div className="bg-white py-4 px-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                {goldSubcategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubcategory(cat.id)}
                    className={`relative pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedSubcategory === cat.id ? "text-[#c9a227]" : "text-gray-600 hover:text-[#c9a227]"
                    }`}
                  >
                    {cat.label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#c9a227] transition-all ${
                        selectedSubcategory === cat.id ? "w-8" : "w-0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Header - Title, Filters, Sort (after banner) */}
        <div className="lg:hidden max-w-[1400px] mx-auto px-4 mb-4">
          {/* First row - Category name and count */}
          <div className="pt-2 pb-2">
            <h1 className="text-lg font-bold">
              {categoryInfo ? categoryInfo.name : "Злато"} ({filteredGold.length})
            </h1>
          </div>

          {/* Second row - Filter buttons */}
          <div className="flex items-center gap-2 pb-2">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button className="bg-[#c9a227] hover:bg-[#b08f1f] text-white rounded-none px-3 py-2 h-auto">
                  <SlidersHorizontal className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-[24px] overflow-hidden p-0 border-t-0">
                <div className="flex justify-center pt-3 pb-2 bg-gradient-to-b from-background to-background/95">
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
                <div className="px-6 pb-2">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Филтри</SheetTitle>
                  </SheetHeader>
                </div>
                <div className="overflow-y-auto px-6 pb-6 h-[calc(85vh-120px)]">
                  <FiltersContent />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-background/0 pt-8">
                  <Button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full h-12 text-base font-semibold rounded-none bg-gradient-to-r from-[#c9a227] to-[#e6b93d] hover:from-[#b08f1f] hover:to-[#c9a227] shadow-lg"
                  >
                    Покажи резултати
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Sort */}
            <button
              onClick={() => {
                setTempSortBy(sortBy)
                setSortDialogOpen(true)
              }}
              className="flex items-center gap-2 pl-2 pr-4 py-2 border border-gray-400 rounded-none hover:bg-gray-50 transition-colors flex-1"
            >
              <span className="text-sm">{getSortLabel(sortBy)}</span>
              <ArrowUpDown className="h-5 w-5 ml-auto" />
            </button>

            {/* Mobile View Toggle - Single list button */}
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 border border-gray-400 rounded-none hover:bg-gray-50"
              title={viewMode === "grid" ? "Списък" : "Решетка"}
            >
              <List className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Category Tabs */}
        <div className="lg:hidden max-w-[1400px] mx-auto px-4 py-3">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {goldSubcategories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedSubcategory(cat.id)}
                className={`relative pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSubcategory === cat.id ? "text-[#c9a227]" : "text-gray-600 hover:text-[#c9a227]"
                }`}
              >
                {cat.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-[#c9a227] transition-all ${
                    selectedSubcategory === cat.id ? "w-full" : "w-0"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-4 min-w-max mt-3">
            {goldSubcategories.slice(6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedSubcategory(cat.id)}
                className={`relative pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSubcategory === cat.id ? "text-[#c9a227]" : "text-gray-600 hover:text-[#c9a227]"
                }`}
              >
                {cat.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-[#c9a227] transition-all ${
                    selectedSubcategory === cat.id ? "w-full" : "w-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* Desktop Header - Title and Sort */}
        <div className="hidden lg:block">
          <div className="max-w-[1400px] mx-auto px-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                {categoryInfo ? categoryInfo.name : "Злато"} <span className="text-muted-foreground">({filteredGold.length})</span>
              </h1>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <button
                  onClick={() => {
                    setTempSortBy(sortBy)
                    setSortDialogOpen(true)
                  }}
                  className="flex items-center gap-2 pl-3 pr-4 py-2 border border-gray-400 rounded-none hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">{getSortLabel(sortBy)}</span>
                  <ArrowUpDown className="h-5 w-5" />
                </button>

                {/* View Toggle Buttons */}
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 border border-gray-400 rounded-none hover:bg-gray-50"
                  title="Списък"
                >
                  <List className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Filters and Products Grid */}
        <div className="hidden lg:block max-w-[1400px] mx-auto lg:px-4">
          <div className="flex gap-4 items-start">
            {/* Left Sidebar - Desktop Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0 bg-white shadow-sm sticky top-4 self-start">
              <div className="px-4 py-2">
                <FiltersContent />
              </div>
            </aside>

            {/* Right Content - Products Grid */}
            <main className="flex-1 min-w-0">
              <div className="bg-white shadow-sm p-2 lg:p-3">
                {filteredGold.length === 0 ? (
                  <div className="text-center py-16">
                    <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Няма намерено злато</h3>
                    <p className="text-muted-foreground">Опитайте да промените филтрите за търсене</p>
                  </div>
                ) : (
                  <>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 auto-rows-fr"
                          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 auto-rows-fr"
                      }
                    >
                      {paginatedGold.map((item) => {
                        const primaryImage = (item.images && item.images.length > 0 ? item.images[0] : item.image_url) || null
                        const isFav = isFavorited("gold", item.id)
                        const originalPrice = Number(item.price_per_gram) * Number(item.weight_grams)
                        const discountAmount = Number(item.promotions) || 0
                        const finalPrice = Math.max(0, originalPrice - discountAmount)
                        const eurPrice = finalPrice.toFixed(2)
                        const hasPromotion = discountAmount > 0

                        return (
                          <div
                            key={item.id}
                            className="bg-black rounded-lg p-3 relative group hover:border transition-all flex flex-col border h-full"
                            style={{ minHeight: "380px", borderColor: "#333333" }}
                          >
                            {hasPromotion && (
                              <div
                                className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border z-10"
                                style={{ color: "#c9a227", borderColor: "#c9a227", backgroundColor: "#1d1d1f" }}
                              >
                                ПРОМОЦИЯ
                              </div>
                            )}

                            <Link href={`/gold/${item.id}`} className="relative mb-3 flex-shrink-0 flex items-center justify-center" style={{ height: "160px" }}>
                              {primaryImage ? (
                                <img
                                  src={primaryImage}
                                  alt={`${item.weight_grams}g ${item.gold_type}`}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#1d1d1f] flex items-center justify-center">
                                  <Sparkles className="h-8 w-8" style={{ color: "#c9a227" }} />
                                </div>
                              )}
                            </Link>

                            <Link href={`/gold/${item.id}`}>
                              <h3
                                className="text-xs md:text-base font-medium mb-1 line-clamp-2 min-h-[2.25rem] md:min-h-[2.5rem] hover:text-[#f9d254] transition-colors leading-tight"
                                style={{ color: "#ffffff" }}
                              >
                                {item.weight_grams}g {item.gold_type}
                              </h3>
                            </Link>

                            {hasPromotion ? (
                              <div className="mb-2 mt-auto flex items-baseline gap-1 flex-wrap">
                                <span className="text-sm text-red-400 line-through font-semibold">{originalPrice.toFixed(2)} €</span>
                                <span className="text-sm text-gray-500">/</span>
                                <span className="text-lg font-bold text-[#f9d254]">{eurPrice} €</span>
                              </div>
                            ) : (
                              <div className="text-lg font-bold mb-2 text-[#f9d254] mt-auto">{eurPrice} €</div>
                            )}

                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleAddToCart(item, primaryImage || "")
                              }}
                              className="w-full flex items-center overflow-hidden transition-all hover:opacity-90 rounded-lg"
                              style={{ height: "36px" }}
                            >
                              <div
                                className="flex items-center justify-center rounded-l-lg"
                                style={{ backgroundColor: "#222222", width: "40px", height: "36px" }}
                              >
                                <ShoppingCart className="w-4 h-4" style={{ color: "#f9d254" }} />
                              </div>
                              <div
                                className="flex-1 flex items-center justify-center rounded-lg -ml-1"
                                style={{
                                  background: "linear-gradient(135deg, #f9d254 0%, #e6b93d 100%)",
                                  height: "36px",
                                }}
                              >
                                <span className="text-[#1d1d1f] text-sm font-semibold">Добави</span>
                              </div>
                            </button>

                            {/* Compare and Favorites row */}
                            <div className="flex items-center justify-center gap-6 mt-3">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
                                style={{ color: "#9e9e9e" }}
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                  <polygon fill="#9e9e9e" points="2.1,16.8 9.8,22 9.8,19.6 21.9,19.6 21.9,13.8 9.8,13.8 9.8,11.4" />
                                  <polygon fill="#9e9e9e" points="21.9,7.3 14.2,2 14.2,4.4 2.1,4.4 2.1,10.2 14.2,10.2 14.2,12.6" />
                                </svg>
                                <span>Сравни</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleToggleFavorite(item)
                                }}
                                className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
                                style={{ color: "#9e9e9e" }}
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path
                                    fill={isFav ? "#e60200" : "#9e9e9e"}
                                    d="M16.5,3C19.6,3,22,5.4,22,8.5c0,3.8-3.4,6.9-8.6,11.5L12,21.4L10.6,20C5.4,15.4,2,12.3,2,8.5C2,5.4,4.4,3,7.5,3c1.7,0,3.4,0.8,4.5,2.1C13.1,3.8,14.8,3,16.5,3"
                                  />
                                </svg>
                                <span>Любими</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Pagination */}
                    {filteredGold.length > 0 && (
                      <div className="flex justify-center items-center gap-2 py-4 px-6">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border transition-all"
                          style={{
                            borderColor: "#c9a227",
                            color: currentPage === 1 ? "#ccc" : "#c9a227",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          }}
                        >
                          Предишна
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10 h-10 border transition-all"
                              style={{
                                borderColor: "#c9a227",
                                backgroundColor: currentPage === pageNum ? "#c9a227" : "transparent",
                                color: currentPage === pageNum ? "white" : "#c9a227",
                              }}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        {totalPages > 5 && currentPage < totalPages - 2 && <span style={{ color: "#c9a227" }}>...</span>}

                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border transition-all"
                          style={{
                            borderColor: "#c9a227",
                            color: currentPage === totalPages ? "#ccc" : "#c9a227",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          }}
                        >
                          Следваща
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        </div>

      </section>

      {/* Mobile Products Section */}
      <section className="lg:hidden bg-[#eaebee] pb-6 px-4">
        {filteredGold.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Няма намерено злато</h3>
            <p className="text-muted-foreground">Опитайте да промените филтрите за търсене</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {paginatedGold.map((item) => {
                const primaryImage = (item.images && item.images.length > 0 ? item.images[0] : item.image_url) || null
                const isFav = isFavorited("gold", item.id)
                const originalPrice = Number(item.price_per_gram) * Number(item.weight_grams)
                const discountAmount = Number(item.promotions) || 0
                const finalPrice = Math.max(0, originalPrice - discountAmount)
                const eurPrice = finalPrice.toFixed(2)
                const hasPromotion = discountAmount > 0

                return (
                  <div
                    key={item.id}
                    className="bg-black rounded-lg p-3 relative group hover:border transition-all flex flex-col border"
                    style={{ minHeight: "320px", borderColor: "#333333" }}
                  >
                    {hasPromotion && (
                      <div
                        className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border z-10"
                        style={{ color: "#1a6ea5", borderColor: "#1a6ea5", backgroundColor: "#ffffff" }}
                      >
                        ПРОМОЦИЯ
                      </div>
                    )}

                    <Link href={`/gold/${item.id}`} className="relative aspect-square mb-3 flex-shrink-0 block">
                      {primaryImage ? (
                        <Image
                          src={primaryImage || "/placeholder.svg"}
                          alt={`${item.weight_grams}g ${item.gold_type}`}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-yellow-600" />
                        </div>
                      )}
                    </Link>

                    <Link href={`/gold/${item.id}`}>
                      <h3
                        className="text-xs font-medium mb-1 line-clamp-2 min-h-[2.25rem] hover:text-[#f9d254] transition-colors leading-tight"
                        style={{ color: "#ffffff" }}
                      >
                        {item.weight_grams}g {item.gold_type}
                      </h3>
                    </Link>

                    {hasPromotion ? (
                      <div className="mb-2 mt-auto flex items-baseline gap-1 flex-wrap">
                        <span className="text-xs text-red-400 line-through font-semibold">{originalPrice.toFixed(2)} €</span>
                        <span className="text-xs text-gray-500">/</span>
                        <span className="text-base font-bold text-[#f9d254]">{eurPrice} €</span>
                      </div>
                    ) : (
                      <div className="text-base font-bold mb-2 text-[#f9d254] mt-auto">{eurPrice} €</div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddToCart(item, primaryImage)
                      }}
                      className="w-full flex items-center overflow-hidden transition-all hover:opacity-90 rounded-lg"
                      style={{ height: "32px" }}
                    >
                      <div
                        className="flex items-center justify-center rounded-l-lg"
                        style={{ backgroundColor: "#222222", width: "36px", height: "32px" }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" style={{ color: "#f9d254" }} />
                      </div>
                      <div
                        className="flex-1 flex items-center justify-center rounded-lg -ml-1"
                        style={{
                          background: "linear-gradient(135deg, #f9d254 0%, #e6b93d 100%)",
                          height: "32px",
                        }}
                      >
                        <span className="text-[#1d1d1f] text-xs font-semibold">Добави</span>
                      </div>
                    </button>

                    {/* Compare and Favorites row */}
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Compare functionality placeholder
                        }}
                        className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
                        style={{ color: "#9e9e9e" }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <polygon fill="#9e9e9e" points="2.1,16.8 9.8,22 9.8,19.6 21.9,19.6 21.9,13.8 9.8,13.8 9.8,11.4" />
                          <polygon fill="#9e9e9e" points="21.9,7.3 14.2,2 14.2,4.4 2.1,4.4 2.1,10.2 14.2,10.2 14.2,12.6" />
                        </svg>
                        <span>Сравни</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleToggleFavorite(item)
                        }}
                        className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
                        style={{ color: "#9e9e9e" }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill={isFav ? "#e60200" : "#9e9e9e"}
                            d="M16.5,3C19.6,3,22,5.4,22,8.5c0,3.8-3.4,6.9-8.6,11.5L12,21.4L10.6,20C5.4,15.4,2,12.3,2,8.5C2,5.4,4.4,3,7.5,3c1.7,0,3.4,0.8,4.5,2.1C13.1,3.8,14.8,3,16.5,3"
                          />
                        </svg>
                        <span>Любими</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredGold.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{
                    borderColor: currentPage === 1 ? "#d1d5db" : "#1b6fa4",
                    color: currentPage === 1 ? "#9ca3af" : "#1b6fa4",
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span className="text-xs font-medium">Предишна</span>
                </button>

                <span
                  className="px-3 py-2 rounded-lg border-2 text-xs font-medium"
                  style={{
                    borderColor: "#1b6fa4",
                    backgroundColor: "#1b6fa4",
                    color: "white",
                  }}
                >
                  {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{
                    borderColor: currentPage === totalPages ? "#d1d5db" : "#1b6fa4",
                    color: currentPage === totalPages ? "#9ca3af" : "#1b6fa4",
                  }}
                >
                  <span className="text-xs font-medium">Следваща</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Dialog open={sortDialogOpen} onOpenChange={setSortDialogOpen}>
        <DialogContent 
          className="max-w-[240px] p-0 gap-0 rounded-none border-0 shadow-lg"
          overlayClassName="bg-black/30"
          hideCloseButton
        >
          {/* Gold top line */}
          <div className="h-1 bg-[#c9a227] w-full" />
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white">
            <DialogTitle className="text-base font-semibold">Подреди по</DialogTitle>
            <button
              onClick={() => setSortDialogOpen(false)}
              className="text-[#c9a227] hover:text-[#b08f1f] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Options */}
          <div className="px-4 py-4 space-y-5 bg-white">
            {[
              { value: "price_asc", label: "Цена възходящо" },
              { value: "price_desc", label: "Цена низходящо" },
              { value: "newest", label: "Най-нови" },
              { value: "weight_asc", label: "Тегло възходящо" },
              { value: "weight_desc", label: "Тегло низходящо" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setTempSortBy(option.value)}
              >
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  tempSortBy === option.value ? 'border-gray-300 bg-white' : 'border-gray-300 bg-white'
                }`}>
                  {tempSortBy === option.value && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          
          {/* Footer buttons */}
          <div className="flex gap-2 px-4 py-3 bg-white">
            <Button 
              onClick={() => {
                setSortBy(tempSortBy)
                setSortDialogOpen(false)
              }}
              className="flex-1 bg-[#c9a227] hover:bg-[#b08f1f] text-white rounded h-9 text-sm"
            >
              Запази
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSortDialogOpen(false)}
              className="flex-1 border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 rounded h-9 text-sm"
            >
              Отка����
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
