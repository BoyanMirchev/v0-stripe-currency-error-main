"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Store {
  id: number
  name: string
  address: string
  city: string
  neighborhood: string | null
  working_hours: string
  image_url: string | null
  rating: number
  is_24_7: boolean
  latitude: number | null
  longitude: number | null
  phone: string | null
}

interface Parameter {
  id: number
  name: string
  options: { id: number; value: string }[]
}

interface ProductDetailsSectionsProps {
  specifications: { key: string; value: string }[]
  store: Store | null
  location?: string | null
  description?: string | null
  features?: string[] | null
  parameters?: Parameter[]
  manufacturerName?: string | null
  category: string
  brand: string
  model: string
  condition: string
}

export function ProductDetailsSections({
  specifications,
  store,
  location,
  description,
  features,
  parameters,
  manufacturerName,
  category,
  brand,
  model,
  condition,
}: ProductDetailsSectionsProps) {
  const [expandedSections, setExpandedSections] = useState({
    specs: true,
    stores: true,
    description: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="mt-4 md:mt-6 space-y-0">
      {/* Технически спецификации / Характеристики */}
      <div className="border-b border-[#d2d2d7]">
        <button
          onClick={() => toggleSection("specs")}
          className="w-full flex items-center justify-between py-4 md:py-6 px-6 text-left hover:opacity-70 transition-opacity bg-gradient-to-r from-[#eaecef] to-[#f9f9f9] shadow-md"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-[#1d1d1f]">Характеристики</h3>
          {expandedSections.specs ? (
            <ChevronUp size={24} className="text-[#1d1d1f]" />
          ) : (
            <ChevronDown size={24} className="text-[#1d1d1f]" />
          )}
        </button>
        {expandedSections.specs && (
          <div className="pb-6 md:pb-8">
            <div className="mt-6">
              {/* Basic specifications */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-3 px-6 bg-[#f0f0f0]">
                <h4 className="font-semibold text-[#1d1d1f] text-sm md:text-base">Категория</h4>
                <div className="text-xs md:text-sm text-[#86868b]">{category}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-3 px-6 bg-white">
                <h4 className="font-semibold text-[#1d1d1f] text-sm md:text-base">Марка</h4>
                <div className="text-xs md:text-sm text-[#86868b]">{brand}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-3 px-6 bg-[#f0f0f0]">
                <h4 className="font-semibold text-[#1d1d1f] text-sm md:text-base">Модел</h4>
                <div className="text-xs md:text-sm text-[#86868b]">{model}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-3 px-6 bg-white">
                <h4 className="font-semibold text-[#1d1d1f] text-sm md:text-base">Състояние</h4>
                <div className="text-xs md:text-sm text-[#86868b]">{condition}</div>
              </div>

              {/* Additional specifications */}
              {specifications.length > 0 &&
                specifications.map((spec, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-3 px-6 ${
                      (index + 4) % 2 === 0 ? "bg-[#f0f0f0]" : "bg-white"
                    }`}
                  >
                    <h4 className="font-semibold text-[#1d1d1f] text-sm md:text-base">{spec.key}</h4>
                    <div className="text-xs md:text-sm text-[#86868b]">{spec.value}</div>
                  </div>
                ))}

              {/* Parameters if available */}
              {parameters && parameters.length > 0 && (
                <>
                  {parameters.map((param, index) => (
                    <div
                      key={param.id}
                      className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-3 px-6 ${
                        (index + 4 + specifications.length) % 2 === 0 ? "bg-[#f0f0f0]" : "bg-white"
                      }`}
                    >
                      <h4 className="font-semibold text-[#1d1d1f] text-sm md:text-base">{param.name}</h4>
                      <div className="text-xs md:text-sm text-[#86868b]">
                        {param.options.map((option, idx) => (
                          <span key={option.id}>
                            {option.value}
                            {idx < param.options.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {specifications.length === 0 && (!parameters || parameters.length === 0) && (
                <p className="text-xs md:text-sm text-[#86868b] mt-6 px-6">
                  Моля, свържете се с нас за подробни технически спецификации.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Наличност по магазините */}
      <div className="border-b border-[#d2d2d7]">
        <button
          onClick={() => toggleSection("stores")}
          className="w-full flex items-center justify-between py-4 md:py-6 px-6 text-left hover:opacity-70 transition-opacity bg-gradient-to-r from-[#eaecef] to-[#f9f9f9] shadow-md"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-[#1d1d1f]">Наличност по магазините</h3>
          {expandedSections.stores ? (
            <ChevronUp size={24} className="text-[#1d1d1f]" />
          ) : (
            <ChevronDown size={24} className="text-[#1d1d1f]" />
          )}
        </button>
        {expandedSections.stores && (
          <div className="pb-6 md:pb-8 px-6 mt-6">
            {store ? (
              <div className="border border-gray-200 overflow-hidden bg-white shadow-sm">
                <Link
                  href="/stores"
                  className="block hover:bg-gray-50/50 transition-colors p-5"
                >
                  <div className="flex items-start gap-4">
                    {store.image_url && (
                      <div className="relative w-24 h-24 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                        <Image
                          src={store.image_url || "/placeholder.svg"}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{store.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {store.address}, {store.city}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-sm text-green-600 font-semibold">
                          {store.is_24_7 ? "Денонощно" : store.working_hours}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2 rotate-[-90deg]" />
                  </div>
                </Link>
                {store.phone && (
                  <div className="px-5 pb-4">
                    <a
                      href={`tel:${store.phone}`}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-5 font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #f8212a 0%, #D32F2F 100%)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Обади се: {store.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            ) : location ? (
              <p className="text-sm text-[#86868b]">{location}</p>
            ) : (
              <p className="text-sm text-[#86868b]">Налично във всички магазини</p>
            )}
          </div>
        )}
      </div>

      {/* Описание */}
      {description && (
        <div className="border-b border-[#d2d2d7]">
          <button
            onClick={() => toggleSection("description")}
            className="w-full flex items-center justify-between py-4 md:py-6 px-6 text-left hover:opacity-70 transition-opacity bg-gradient-to-r from-[#eaecef] to-[#f9f9f9] shadow-md"
          >
            <h3 className="text-xl md:text-2xl font-semibold text-[#1d1d1f]">Описание</h3>
            {expandedSections.description ? (
              <ChevronUp size={24} className="text-[#1d1d1f]" />
            ) : (
              <ChevronDown size={24} className="text-[#1d1d1f]" />
            )}
          </button>
          {expandedSections.description && (
            <div className="pb-6 md:pb-8 px-6 mt-6">
              <p className="text-sm md:text-base text-[#86868b] leading-relaxed">{description}</p>
            </div>
          )}
        </div>
      )}


    </div>
  )
}
