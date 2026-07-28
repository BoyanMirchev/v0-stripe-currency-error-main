"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface SiteSettings {
  logo_url: string
  logo_alt: string
  logo_width: number
  logo_height: number
  favicon_url: string
  apple_touch_icon: string
  site_name: string
}

const defaultSettings: SiteSettings = {
  logo_url: "/kesh-logo.png",
  logo_alt: "КЕШ Logo",
  logo_width: 110,
  logo_height: 40,
  favicon_url: "/icon.svg",
  apple_touch_icon: "/apple-icon.png",
  site_name: "КЕШ"
}

interface SiteSettingsContextType {
  settings: SiteSettings
  isLoading: boolean
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: true
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/site-settings")
        if (response.ok) {
          const data = await response.json()
          setSettings({
            logo_url: data.logo_url || defaultSettings.logo_url,
            logo_alt: data.logo_alt || defaultSettings.logo_alt,
            logo_width: data.logo_width || defaultSettings.logo_width,
            logo_height: data.logo_height || defaultSettings.logo_height,
            favicon_url: data.favicon_url || defaultSettings.favicon_url,
            apple_touch_icon: data.apple_touch_icon || defaultSettings.apple_touch_icon,
            site_name: data.site_name || defaultSettings.site_name
          })
        }
      } catch (error) {
        console.error("[v0] Failed to fetch site settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider")
  }
  return context
}
