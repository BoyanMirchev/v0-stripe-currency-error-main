"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarouselSlide {
  src: string
  alt: string
  link?: string | null
}

interface IpadCarouselProps {
  slides?: CarouselSlide[]
  mobileSlides?: CarouselSlide[]
  desktopSlides?: CarouselSlide[]
  options?: {
    loop?: boolean
  }
  className?: string
}

const defaultSlides: CarouselSlide[] = [
  {
    src: "/banners/lg-refrigerator-banner.png",
    alt: "LG Refrigerator Banner",
  },
  {
    src: "/banners/philips-tv-banner.png",
    alt: "Philips Ambilight TV Banner",
  },
  {
    src: "/banners/acer-laptop-banner.png",
    alt: "Acer Aspire Go 15 Banner",
  },
]

export function IpadCarousel({ slides, mobileSlides, desktopSlides, options, className }: IpadCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const displaySlides = isMobile
    ? mobileSlides && mobileSlides.length > 0
      ? mobileSlides
      : slides && slides.length > 0
        ? slides
        : defaultSlides
    : desktopSlides && desktopSlides.length > 0
      ? desktopSlides
      : slides && slides.length > 0
        ? slides
        : defaultSlides

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displaySlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const SlideWrapper = ({ slide, children }: { slide: CarouselSlide; children: React.ReactNode }) => {
    if (slide.link) {
      return (
        <Link href={slide.link} className="block w-full h-full">
          {children}
        </Link>
      )
    }
    return <>{children}</>
  }

  return (
    <div className={cn("relative w-full h-[200px] md:h-[357px] overflow-hidden bg-background", className)}>
      {/* Carousel slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {displaySlides.map((slide, index) => (
          <div key={index} className="min-w-full h-full relative">
            <SlideWrapper slide={slide}>
              <Image
                src={slide.src || "/placeholder.svg"}
                alt={slide.alt}
                fill
                className="object-cover md:object-contain"
                priority={index === 0}
              />
            </SlideWrapper>
          </div>
        ))}
      </div>

      {/* Previous button */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[60px] h-[60px] flex items-center justify-center hover:bg-black/5 transition-colors z-10"
        aria-label="Previous slide"
      >
        <div className="w-[60px] h-[60px] flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-[#1B6EA5]" strokeWidth={3} />
        </div>
      </button>

      {/* Next button */}
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[60px] h-[60px] flex items-center justify-center hover:bg-black/5 transition-colors z-10"
        aria-label="Next slide"
      >
        <div className="w-[60px] h-[60px] flex items-center justify-center">
          <ChevronRight className="w-6 h-6 text-[#1B6EA5]" strokeWidth={3} />
        </div>
      </button>

      {/* Carousel indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group p-0.5"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all shadow-sm ${
                index === currentSlide ? "bg-red-500 w-8" : "bg-white group-hover:bg-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
