import * as React from "react"
import { Tv, Laptop, Smartphone, Refrigerator, Coffee, Camera, Gamepad2, Tag } from "lucide-react"
import Image from "next/image"
import { IpadCarousel } from "@/components/banner-slider"
import { FeaturedProducts } from "@/components/featured-products-section"
import { NavigationMenuLink } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { neon } from "@neondatabase/serverless"
import { CarsSection } from "@/components/cars-section"
import { EquipmentSection } from "@/components/equipment-section"
import RemingtonFeaturedSection from "@/components/remington-featured-section"
import { SmartphoneUpgradeBanner } from "@/components/smartphone-upgrade-banner"
import { PromotionalCardsSection } from "@/components/promotional-cards-section"
import { GoldCategoriesSection } from "@/components/gold-categories-section"

const KeshLogo = () => (
  <div className="flex items-center flex-shrink-0">
    <Image src="/kesh-logo.png" alt="Кеш Logo" width={110} height={40} className="object-contain" />
  </div>
)

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="flex items-center gap-2 text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"

const menuCategories: { title: string; href: string; description: string; icon: React.ElementType }[] = [
  {
    title: "TV, Аудио и Видео",
    href: "/products/tv-audio",
    description: "Телевизори, саундбар системи, проектори.",
    icon: Tv,
  },
  {
    title: "Компютри и периферия",
    href: "/products/computers",
    description: "Лаптопи, настолни компютри, монитори.",
    icon: Laptop,
  },
  {
    title: "Смартфони и таблети",
    href: "/products/mobile",
    description: "Смартфони, таблети и смарт часовници.",
    icon: Smartphone,
  },
  {
    title: "Големи електроуреди",
    href: "/products/large-appliances",
    description: "Хладилници, перални, съдомиялни.",
    icon: Refrigerator,
  },
  {
    title: "Малки електроуреди",
    href: "/products/small-appliances",
    description: "Кафемашини, прахосмукачки, ютии.",
    icon: Coffee,
  },
  {
    title: "Фото и Видео",
    href: "/products/photo-video",
    description: "Фотоапарати, камери и аксесоари.",
    icon: Camera,
  },
  {
    title: "Гейминг",
    href: "/products/gaming",
    description: "Конзоли, игри и аксесоари.",
    icon: Gamepad2,
  },
  {
    title: "Всички промоции",
    href: "/promotions",
    description: "Вижте актуалните ни оферти.",
    icon: Tag,
  },
]

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let slides = [
    { src: "/banners/lg-refrigerator-banner.png", alt: "LG Refrigerator Banner" },
    { src: "/banners/philips-tv-banner.png", alt: "Philips Ambilight TV Banner" },
    { src: "/banners/acer-laptop-banner.png", alt: "Acer Aspire Go 15 Banner" },
  ]

  let mobileSlides: any[] = []
  let desktopSlides: any[] = []
  
  // Section visibility settings with defaults
  let sectionVisibility = {
    gold: true,
    equipment: true,
    cars: true
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Fetch mobile banners
    const mobileBanners = await sql`
      SELECT * FROM home_banners 
      WHERE is_active = true AND is_mobile = true
      ORDER BY display_order ASC
    `

    // Fetch desktop banners
    const desktopBanners = await sql`
      SELECT * FROM home_banners 
      WHERE is_active = true AND (is_mobile = false OR is_mobile IS NULL)
      ORDER BY display_order ASC
    `

    if (mobileBanners && mobileBanners.length > 0) {
      mobileSlides = mobileBanners.map((banner: any) => ({
        src: banner.image_url,
        alt: banner.alt_text || "Banner",
        link: banner.link_url,
      }))
    }

    if (desktopBanners && desktopBanners.length > 0) {
      desktopSlides = desktopBanners.map((banner: any) => ({
        src: banner.image_url,
        alt: banner.alt_text || "Banner",
        link: banner.link_url,
      }))
    }

    // If we have device-specific banners, use those; otherwise fall back to default
    if (mobileSlides.length === 0 && desktopSlides.length === 0) {
      // Query old way for backward compatibility
      const banners = await sql`
        SELECT * FROM home_banners 
        WHERE is_active = true 
        ORDER BY display_order ASC
      `

      if (banners && banners.length > 0) {
        slides = banners.map((banner: any) => ({
          src: banner.image_url,
          alt: banner.alt_text || "Banner",
          link: banner.link_url,
        }))
      }
    }
    
    // Fetch section visibility settings
    const visibilityResult = await sql`
      SELECT section_key, is_visible
      FROM homepage_section_visibility
    `
    
    if (visibilityResult && visibilityResult.length > 0) {
      visibilityResult.forEach((row: any) => {
        if (row.section_key in sectionVisibility) {
          sectionVisibility[row.section_key as keyof typeof sectionVisibility] = row.is_visible
        }
      })
    }
  } catch (error) {
    console.error("[v0] Error loading homepage data from database:", error)
    // Falls back to default slides and visibility if database query fails
  }

  return (
    <>
      <Header />
      <div className="bg-white min-h-screen pt-[180px] lg:pt-[120px]">
        <div className="bg-white overflow-x-hidden py-3">
          <IpadCarousel
            slides={slides}
            mobileSlides={mobileSlides}
            desktopSlides={desktopSlides}
            options={{ loop: true }}
            className="mx-auto px-4 max-w-full"
          />
        </div>
        {sectionVisibility.gold && <GoldCategoriesSection />}
        {sectionVisibility.equipment && <EquipmentSection />}
        <RemingtonFeaturedSection />
        {sectionVisibility.cars && <CarsSection />}
        <SmartphoneUpgradeBanner />
        {sectionVisibility.gold && <FeaturedProducts />}
        <PromotionalCardsSection />
      </div>
    </>
  )
}
