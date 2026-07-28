"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useSiteSettings } from "@/contexts/site-settings-context"

const timelineEvents = [
  { year: "2008", title: "Основаване на KESH", description: "Стартиране на KESH Bulgaria с фокус върху злато и електроника" },
  { year: "2012", title: "Разширяване", description: "Добавяне на автомобилна категория и отваряне на втори магазин" },
  { year: "2016", title: "Растеж", description: "Достигане на 5,000+ доволни клиенти" },
  { year: "2019", title: "Иновации", description: "Стартиране на онлайн платформа и доставки в цялата страна" },
  { year: "2022", title: "Лидерство", description: "Утвърждаване като водещ търговец в региона" },
  { year: "2025", title: "Бъдещето", description: "Нови партньорства и разширяване на продуктовата гама" },
]

const values = [
  {
    title: "Доверие",
    description: "Доверието е всичко. В нашата сфера на дейност, доверието или развива бизнеса, или го убива. Да бъдем възприемани като надежден партньор за нас означава успех, това е основата на нашата дейност, силата, която ни кара да вървим напред. За да повишим доверието в нас, ние винаги предлагаме качествени продукти, безупречно обслужване, безпристрастни съвети и сигурен и удобен начин да закупите злато, техника и автомобили на най-добрите пазарни цени.",
  },
  {
    title: "Интегритет",
    description: "Действаме честно и етично във всичко, което правим. Спазваме обещанията си и се държим отговорно към нашите клиенти, партньори и общество. Интегритетът е в основата на всяко наше решение.",
  },
  {
    title: "Партньорство",
    description: "Вярваме, че най-добрите резултати идват от силни партньорства. Работим заедно с нашите клиенти, за да разберем техните нужди и да предложим решения, които надхвърлят очакванията им.",
  },
]

const stats = [
  { number: "3", label: "Категории продукти" },
  { number: "10,000+", label: "Доволни клиенти" },
  { number: "17+", label: "Години опит" },
  { number: "99%", label: "Удовлетвореност" },
  { number: "1000+", label: "Продукти в каталога" },
]

export default function AboutPage() {
  const { settings } = useSiteSettings()
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0)
  const [activeValueIndex, setActiveValueIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveValueIndex((prev) => (prev + 1) % values.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero Section - Inspired by Tavex */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a] text-white overflow-hidden pt-32 lg:pt-24">
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Kesh Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src={settings.logo_url || "/kesh-logo.png"}
                alt={settings.logo_alt || "КЕШ Logo"}
                width={160}
                height={60}
                className="object-contain"
              />
            </div>
            
            <p className="text-sm tracking-[0.3em] text-yellow-500/80 uppercase">
              Злато · Техника · Автомобили
            </p>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight text-balance text-white/90">
              Лидер на пазара за злато, техника и автомобили в България
            </h1>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
                <span className="text-5xl md:text-6xl font-serif text-zinc-500 float-left mr-3 leading-none">К</span>
                ESH Bulgaria е основана през 2008 г. и се е утвърдила като водещ търговец на злато, електроника и автомобили, обслужващ хиляди клиенти годишно.
              </p>
            </div>

            {/* Gold bar image area */}
            <div className="pt-12 flex justify-center">
              <div className="relative w-64 h-24 opacity-80">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-sm shadow-2xl transform perspective-1000 rotate-x-12" 
                     style={{ boxShadow: "0 20px 60px rgba(234, 179, 8, 0.3)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Numbered like Tavex */}
      <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-yellow-500/20 to-transparent" style={{ left: "50%" }} />
        
        <div className="container mx-auto px-4">
          {/* Gold Section */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
            <div className="relative order-2 md:order-1">
              <span className="absolute -left-4 md:-left-20 top-0 text-[200px] font-serif text-zinc-800/30 leading-none select-none">01</span>
              <div className="relative z-10 pl-8 md:pl-0">
                <div className="h-px w-32 bg-yellow-500/50 mb-8" />
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">Инвестиционно злато</h2>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Услугите ни включват продажба на <span className="text-yellow-500">златни монети и кюлчета</span> з�� инвестиционни цели. Сътрудничим си само с най-доказалите се рафинерии в света. Всички златни изделия са със сертификат за автентичност.
                </p>
                <Button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-none"
                  asChild
                >
                  <Link href="/gold">Разгледайте продуктите</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] order-1 md:order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent z-10" />
              <Image
                src="/about-gold-bars.jpg"
                alt="Инвестиционно злато"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 text-white/70 text-sm">
                Купувайте и продавайте злато с KESH
              </div>
            </div>
          </div>

          {/* Electronics Section */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
            <div className="relative h-[300px] md:h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-transparent to-transparent z-10" />
              <Image
                src="/about-electronics.jpg"
                alt="Електроника"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 text-white/70 text-sm">
                Техника от водещи марки
              </div>
            </div>
            <div className="relative">
              <span className="absolute -right-4 md:-right-20 top-0 text-[200px] font-serif text-zinc-800/30 leading-none select-none">02</span>
              <div className="relative z-10 pr-8 md:pr-0">
                <div className="h-px w-32 bg-yellow-500/50 mb-8" />
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">Техника и електроника</h2>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Предлагаме <span className="text-yellow-500">най-новата техника</span> от водещи световни марки. Телевизори, компютри, смартфони и домакински уреди с пълна гаранция и професионална консултация.
                </p>
                <Button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-none"
                  asChild
                >
                  <Link href="/equipment">Разгледайте продуктите</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Cars Section */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative order-2 md:order-1">
              <span className="absolute -left-4 md:-left-20 top-0 text-[200px] font-serif text-zinc-800/30 leading-none select-none">03</span>
              <div className="relative z-10 pl-8 md:pl-0">
                <div className="h-px w-32 bg-yellow-500/50 mb-8" />
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">Автомобили</h2>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Селекция от <span className="text-yellow-500">луксозни и практични автомобили</span> за всеки вкус. Всеки автомобил преминава щателна проверка и идва с пълна документация и история.
                </p>
                <Button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-none"
                  asChild
                >
                  <Link href="/cars">Разгледайте автомобили</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] order-1 md:order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent z-10" />
              <Image
                src="/about-luxury-car.jpg"
                alt="Автомобили"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 text-white/70 text-sm">
                Автомобили с гаранция
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section - Inspired by Tavex */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="relative h-[400px] md:h-[600px]">
              <Image
                src="/about-store-interior.jpg"
                alt="KESH Bulgaria История"
                fill
                className="object-cover grayscale-[30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]" />
              
              {/* Navigation Arrows */}
              <button 
                onClick={() => setActiveTimelineIndex((prev) => (prev - 1 + timelineEvents.length) % timelineEvents.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button 
                onClick={() => setActiveTimelineIndex((prev) => (prev + 1) % timelineEvents.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Content Side */}
            <div className="text-white space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif">Създаването на KESH</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                {timelineEvents[activeTimelineIndex].description}
              </p>
              
              {/* Timeline */}
              <div className="pt-8">
                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                  {timelineEvents.map((event, index) => (
                    <button
                      key={event.year}
                      onClick={() => setActiveTimelineIndex(index)}
                      className="flex flex-col items-center gap-2 min-w-fit"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                        index === activeTimelineIndex 
                          ? "border-yellow-500 bg-transparent" 
                          : index < activeTimelineIndex 
                            ? "border-zinc-600 bg-zinc-600" 
                            : "border-zinc-700 bg-transparent"
                      }`} />
                      <span className={`text-sm transition-colors ${
                        index === activeTimelineIndex ? "text-yellow-500 font-semibold" : "text-zinc-500"
                      }`}>
                        {event.year}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="h-px bg-zinc-800 -mt-6 relative z-[-1]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Diamond Cards like Tavex */}
      <section className="py-24 bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#0a0a0a] relative overflow-hidden">
        {/* Purple decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">KESH в цифри</h2>
            <p className="text-zinc-400 mt-4">Ключови цифри за нашия бизнес и постижения</p>
          </div>
          
          {/* Diamond Grid */}
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="w-40 h-40 md:w-48 md:h-48 bg-[#0a0a0a] rotate-45 flex items-center justify-center shadow-2xl border border-zinc-800/50"
              >
                <div className="-rotate-45 text-center">
                  <div className="text-3xl md:text-4xl font-light text-white mb-2">{stat.number}</div>
                  <div className="text-xs md:text-sm text-zinc-400 max-w-[100px]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - Carousel like Tavex */}
      <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {/* Kesh Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src={settings.logo_url || "/kesh-logo.png"}
                alt={settings.logo_alt || "КЕШ Logo"}
                width={80}
                height={30}
                className="object-contain opacity-70"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
              Вярваме силно в ценностите ни и живеем според тях
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Всеки служител, всеки мениджър и всеки клиент споделя тези наши ценности.
            </p>
          </div>
          
          {/* Values Carousel */}
          <div className="relative max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              {/* Previous value preview */}
              <div className="hidden lg:block absolute left-0 text-zinc-700/30 text-6xl md:text-8xl font-serif truncate max-w-[200px]">
                {values[(activeValueIndex - 1 + values.length) % values.length].title.charAt(0)}
              </div>
              
              {/* Main value */}
              <div className="text-center max-w-3xl mx-auto px-4">
                <h3 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-8 transition-all duration-500">
                  {values[activeValueIndex].title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-lg max-w-2xl mx-auto transition-all duration-500">
                  {values[activeValueIndex].description}
                </p>
              </div>
              
              {/* Next value preview */}
              <div className="hidden lg:block absolute right-0 text-zinc-700/30 text-6xl md:text-8xl font-serif truncate max-w-[200px]">
                {values[(activeValueIndex + 1) % values.length].title.substring(0, 3)}
              </div>
            </div>
            
            {/* Value indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {values.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveValueIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeValueIndex ? "bg-yellow-500" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/gold-texture.jpg')] opacity-10 mix-blend-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
              Готови ли сте да откриете перфектния продукт?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Нашият екип е на разположение да ви помогне да направите най-доброто решение
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-white text-yellow-600 hover:bg-zinc-100 font-semibold text-lg px-8 rounded-none"
                asChild
              >
                <Link href="/contact">Свържете се с нас</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-yellow-600 text-lg px-8 bg-transparent rounded-none"
                asChild
              >
                <Link href="/">Разгледайте каталога</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
