import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Check, ArrowRight } from "lucide-react"
import { ClientHeroAnimation } from "@/components/client-hero-animation"

export default function Home() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="circle-decoration w-[500px] h-[500px] top-[-200px] right-[-100px]"></div>
        <div className="circle-decoration w-[300px] h-[300px] bottom-[-100px] left-[-100px]"></div>

        <section className="py-20 md:py-32 relative">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="enhancv-badge mb-4">AI-Powered Resume Analysis</div>
                  <h1>Is your resume good enough?</h1>
                  <p className="text-muted-foreground text-lg max-w-[500px] mt-4">
                    A free and fast AI resume checker doing crucial checks to ensure your resume is ready to perform and
                    get you interview callbacks.
                  </p>
                </div>
                <div>
                  <Link href="/resume-checker" passHref>
                    <Button size="lg" className="rounded-lg px-8 shadow-lg group">
                      Upload Your Resume
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4 pt-4 bg-accent/30 p-6 rounded-xl border border-accent">
                  <h3 className="text-lg font-medium mb-2">What we check:</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span>ATS Optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span>Industry-specific Analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span>Actionable Feedback</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-3xl opacity-20 animate-pulse-soft"></div>
                  <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-border/50 animate-float">
                    {/* Client-side only animation */}
                    <ClientHeroAnimation />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
