"use client"

import dynamic from "next/dynamic"

// Import the animation component with dynamic import and no SSR
const HeroAnimation = dynamic(() => import("./hero-animation"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[500px] h-[400px] bg-accent/30 rounded-2xl flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
    </div>
  ),
})

export function ClientHeroAnimation() {
  return <HeroAnimation />
}
