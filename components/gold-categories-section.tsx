"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

interface HomepageCategory {
  id: number
  name: string
  slug: string
  homepage_image: string | null
  homepage_order: number
}

const defaultCategories: HomepageCategory[] = [
  {
    id: 1,
    name: "Дамски",
    slug: "damski",
    homepage_image: "/elegant-women-gold-jewelry-necklace-bracelet-luxur.jpg",
    homepage_order: 1,
  },
  {
    id: 2,
    name: "Мъжки",
    slug: "mazhki",
    homepage_image: "/men-gold-chain-bracelet-masculine-jewelry-rocks.jpg",
    homepage_order: 2,
  },
  {
    id: 3,
    name: "Детски",
    slug: "detski",
    homepage_image: "/delicate-gold-children-jewelry-small-bracelet.jpg",
    homepage_order: 3,
  },
  {
    id: 4,
    name: "Монети",
    slug: "moneti",
    homepage_image: "/gold-coins-collection-investment-bullion.jpg",
    homepage_order: 4,
  },
  {
    id: 5,
    name: "Промоции",
    slug: "promotsii",
    homepage_image: "/gold-jewelry-sale-promotion-rings-earrings.jpg",
    homepage_order: 5,
  },
]

export function GoldCategoriesSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [categories, setCategories] = useState<HomepageCategory[]>(defaultCategories)
  const [loading, setLoading] = useState(true)

  // Default fallback images for categories without custom images
  const defaultImages: Record<string, string> = {
    дамски: "/elegant-women-gold-jewelry-necklace-bracelet-luxur.jpg",
    мъжки: "/men-gold-chain-bracelet-masculine-jewelry-rocks.jpg",
    детски: "/delicate-gold-children-jewelry-small-bracelet.jpg",
    монети: "/gold-coins-collection-investment-bullion.jpg",
    промоции: "/gold-jewelry-sale-promotion-rings-earrings.jpg",
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/gold-categories/homepage")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data)
          }
        }
      } catch (error) {
        console.error("Failed to fetch homepage categories:", error)
        // Keep default categories on error
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const getImage = (category: HomepageCategory) => {
    if (category.homepage_image) return category.homepage_image
    // Try to match by name (lowercase)
    const nameLower = category.name.toLowerCase()
    for (const [key, value] of Object.entries(defaultImages)) {
      if (nameLower.includes(key)) return value
    }
    return "/gold-jewelry.jpg"
  }

  if (loading) {
    return (
      <section className="py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-light mb-8 tracking-wide" style={{ color: "#b8860b" }}>
            Категории
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  // Split categories: first 4 in grid, 5th centered below (if exists)
  const topCategories = categories.slice(0, 4)
  const bottomCategory = categories[4]

  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-light mb-8 tracking-wide" style={{ color: "#b8860b" }}>
          Категории
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {topCategories.map((category) => (
            <Link
              key={category.id}
              href={`/gold?category=${category.slug}`}
              className="relative group overflow-hidden rounded-xl aspect-square"
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
              onTouchStart={() => setHoveredId(category.id)}
              onTouchEnd={() => setHoveredId(null)}
            >
              <Image
                src={getImage(category) || "/placeholder.svg"}
                alt={category.name}
                fill
                className={`object-cover transition-transform duration-500 ${
                  hoveredId === category.id ? "scale-110" : "scale-100"
                }`}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  hoveredId === category.id ? "opacity-60" : "opacity-70"
                }`}
                style={{ backgroundColor: "rgba(45, 80, 65, 0.75)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg md:text-xl lg:text-2xl font-medium tracking-wide drop-shadow-lg">
                  {category.name}
                </span>
              </div>
              <div
                className={`absolute inset-0 border-2 rounded-xl transition-all duration-300 ${
                  hoveredId === category.id ? "border-[#b8860b] opacity-100" : "border-transparent opacity-0"
                }`}
              />
            </Link>
          ))}
        </div>

        {bottomCategory && (
          <div className="flex justify-center">
            <Link
              href={`/gold?category=${bottomCategory.slug}`}
              className="relative group overflow-hidden rounded-xl aspect-[4/3] w-full max-w-sm md:max-w-md"
              onMouseEnter={() => setHoveredId(bottomCategory.id)}
              onMouseLeave={() => setHoveredId(null)}
              onTouchStart={() => setHoveredId(bottomCategory.id)}
              onTouchEnd={() => setHoveredId(null)}
            >
              <Image
                src={getImage(bottomCategory) || "/placeholder.svg"}
                alt={bottomCategory.name}
                fill
                className={`object-cover transition-transform duration-500 ${
                  hoveredId === bottomCategory.id ? "scale-110" : "scale-100"
                }`}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  hoveredId === bottomCategory.id ? "opacity-60" : "opacity-70"
                }`}
                style={{ backgroundColor: "rgba(45, 80, 65, 0.75)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg md:text-xl lg:text-2xl font-medium tracking-wide drop-shadow-lg">
                  {bottomCategory.name}
                </span>
              </div>
              <div
                className={`absolute inset-0 border-2 rounded-xl transition-all duration-300 ${
                  hoveredId === bottomCategory.id ? "border-[#b8860b] opacity-100" : "border-transparent opacity-0"
                }`}
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
