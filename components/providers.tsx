"use client"

import type React from "react"

import { CartProvider } from "@/lib/cart-context"
import { CartProvider as CheckoutCartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { FavoritesProvider } from "@/lib/favorites-context"
import { CompareProvider } from "@/lib/compare-context"
import { SiteSettingsProvider } from "@/contexts/site-settings-context"
import { DeliverySettingsProvider } from "@/contexts/delivery-settings-context"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <DeliverySettingsProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CompareProvider>
              <CartProvider>
                <CheckoutCartProvider>
                  {children}
                  <Toaster />
                </CheckoutCartProvider>
              </CartProvider>
            </CompareProvider>
          </FavoritesProvider>
        </AuthProvider>
      </DeliverySettingsProvider>
    </SiteSettingsProvider>
  )
}
