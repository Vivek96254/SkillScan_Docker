"use client"
import { useLottie } from "lottie-react"
import animationData from "@/lib/animation-data"

export default function HeroAnimation() {
  const options = {
    animationData,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)
  return <div className="w-full max-w-[500px] h-[400px]">{View}</div>
}
