"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, BookOpen, MessageSquare, Home } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Study Plan",
      href: "/study-plan",
      icon: BookOpen,
    },
    {
      name: "Interview Questions",
      href: "/interview-questions",
      icon: MessageSquare,
    },
    {
      name: "Resume",
      href: "/resume-checker",
      icon: FileText,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path d="M4 12H20M4 8H20M4 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block tracking-tight">SkillScan</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-8 text-sm flex-1 justify-end">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-muted-foreground hover:text-foreground transition-colors relative py-1 px-2",
                  isActive && "text-primary font-medium",
                )}
              >
                <Icon className="h-4 w-4 mr-1.5" />
                <span className="hidden md:inline-block">{item.name}</span>
                {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
