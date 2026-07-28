"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface PromotionalCard {
  id: number
  position: number
  image_url: string
  link_url: string
}

export function PromotionalCardsSection() {
  const [cards, setCards] = useState<PromotionalCard[]>([])
  const [touchedCard, setTouchedCard] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/promotional-cards")
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch((error) => console.error("Error fetching promotional cards:", error))
  }, [])

  if (cards.length === 0) {
    return null
  }

  return (
    <section className="w-full py-8 bg-[#eaebee]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link key={card.id} href={card.link_url}>
              <div
                className="bg-white overflow-hidden shadow-md hover:shadow-xl transition-all h-96 flex flex-col group relative"
                onTouchStart={() => setTouchedCard(card.id)}
                onTouchEnd={() => setTouchedCard(null)}
              >
                <div
                  className={`relative h-full flex items-center justify-center ${card.position === 2 ? "p-12" : "p-8"} bg-white`}
                >
                  <Image
                    src={card.image_url || "/placeholder.svg"}
                    alt={`Promotional Card ${card.position}`}
                    width={card.position === 3 ? 320 : 280}
                    height={card.position === 3 ? 240 : 220}
                    className="object-contain"
                  />
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-red-600 transition-transform origin-left duration-300 ${
                    touchedCard === card.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
