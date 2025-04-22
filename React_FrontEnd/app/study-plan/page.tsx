"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, BookOpen, Calendar, ArrowRight } from "lucide-react"

export default function StudyPlan() {
  const [role, setRole] = useState("Software Engineer")
  const [weeks, setWeeks] = useState(4)
  const [studyPlan, setStudyPlan] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchStudyPlan = async () => {
    setLoading(true);
    setError("");
    setStudyPlan("");

    try {
      const response = await fetch("http://localhost:5000/generate-study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, weeks }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch study plan");
      }

      const data = await response.json();
      setStudyPlan(data.plan);
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const renderFormattedStudyPlan = () => {
    if (!studyPlan) return null

    return (
      <div className="space-y-6">
        {studyPlan.split("\n").map((line, index) => {
          // Main heading
          if (/^##\s+/.test(line)) {
            return (
              <h2 key={index} className="text-2xl font-bold text-primary">
                {line.replace(/^##\s+/, "")}
              </h2>
            )
          }

          // Week heading
          if (/Week \d+:/i.test(line)) {
            const weekNum = line.match(/Week (\d+):/i)?.[1] || ""
            return (
              <div key={index} className="mt-8 border-b border-border/40 pb-2">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Week {weekNum}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">{line.split(":")[1]?.trim()}</span>
                  </h3>
                </div>
              </div>
            )
          }

          // Key Topics
          else if (line.includes("Key Topics:")) {
            const [label, content] = line.split(":", 2)
            return (
              <div key={index} className="mt-4 bg-accent/30 p-4 rounded-lg border border-accent/50">
                <span className="font-medium">Key Topics: </span>
                <span className="text-muted-foreground">{content.trim()}</span>
              </div>
            )
          }

          // Resources heading
          else if (line.trim() === "Resources:") {
            return (
              <h4 key={index} className="font-medium mt-6 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                Resources:
              </h4>
            )
          }

          // Book resource
          else if (line.includes("• Book:")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">B</span>
                </div>
                <div>
                  <span className="font-medium">Book: </span>
                  <span className="text-muted-foreground">{line.replace("• Book:", "").trim()}</span>
                </div>
              </div>
            )
          }

          // Website resource
          else if (line.includes("• Website:")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">W</span>
                </div>
                <div>
                  <span className="font-medium">Website: </span>
                  <span className="text-muted-foreground">{line.replace("• Website:", "").trim()}</span>
                </div>
              </div>
            )
          }

          else if (line.includes("• Leetcode")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">L</span>
                </div>
                <div>
                  <span className="font-medium">Leetcode </span>
                  <span className="text-muted-foreground">{line.replace("• Leetcode", "").trim()}</span>
                </div>
              </div>
            )
          }

          else if (line.includes("• LeetCode")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">L</span>
                </div>
                <div>
                  <span className="font-medium">Leetcode </span>
                  <span className="text-muted-foreground">{line.replace("• Leetcode", "").trim()}</span>
                </div>
              </div>
            )
          }

          else if (line.includes("• HackerRank")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">H</span>
                </div>
                <div>
                  <span className="font-medium">HackerRank </span>
                  <span className="text-muted-foreground">{line.replace("• HackerRank", "").trim()}</span>
                </div>
              </div>
            )
          }

          else if (line.includes("• Practice")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">P</span>
                </div>
                <div>
                  <span className="font-medium">Practice </span>
                  <span className="text-muted-foreground">{line.replace("• Practice", "").trim()}</span>
                </div>
              </div>
            )
          }

          else if (line.includes("• Conduct")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">C</span>
                </div>
                <div>
                  <span className="font-medium">Conduct </span>
                  <span className="text-muted-foreground">{line.replace("• Conduct", "").trim()}</span>
                </div>
              </div>
            )
          }
          else if (line.includes("• Article")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">A</span>
                </div>
                <div>
                  <span className="font-medium">Article </span>
                  <span className="text-muted-foreground">{line.replace("• Article", "").trim()}</span>
                </div>
              </div>
            )
          }
          // else if (line.trim().startsWith("•")) {
          //   const content = line.replace("•", "").trim()
          //   const typeMatch = content.match(/^(\w+):/)
          
          //   const iconLetter = typeMatch ? typeMatch[1][0].toUpperCase() : "•"
          //   const restOfContent = typeMatch ? content.replace(/^(\w+):/, "").trim() : content
          
          //   return (
          //     <div key={index} className="ml-8 my-2 flex items-start">
          //       <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
          //         <span className="text-xs font-bold text-primary">{iconLetter}</span>
          //       </div>
          //       <div>
          //         {typeMatch && <span className="font-medium">{typeMatch[1]}: </span>}
          //         <span className="text-muted-foreground">{restOfContent}</span>
          //       </div>
          //     </div>
          //   )
          // }

          // Daily Practice heading
          else if (line.trim() === "Daily Practice:") {
            return (
              <h4 key={index} className="font-medium mt-6 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Daily Practice:
              </h4>
            )
          }

          // Bullet points
          else if (line.trim().startsWith("•")) {
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span className="text-muted-foreground">{line.replace("•", "").trim()}</span>
              </div>
            )
          }

          // Numbered items
          else if (/^\d+\./.test(line.trim())) {
            const [num, content] = line.trim().split(".", 2)
            return (
              <div key={index} className="ml-8 my-2 flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{num}</span>
                </div>
                <span className="text-muted-foreground">{content.trim()}</span>
              </div>
            )
          }

          // Empty lines
          else if (line.trim() === "") {
            return <div key={index} className="h-2"></div>
          }

          // Default paragraph
          else {
            return (
              <p key={index} className="my-1 text-muted-foreground">
                {line}
              </p>
            )
          }
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-40 h-40 pattern-dots opacity-20"></div>
      <div className="absolute bottom-40 right-20 w-40 h-40 pattern-dots opacity-20"></div>

      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <Card className="enhancv-card">
          <CardHeader className="text-center pb-2 border-b">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Study Plan Generator</CardTitle>
            <CardDescription className="text-muted-foreground">
              Create a customized study plan for your career preparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-medium">
                  Select Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger
                    id="role"
                    className="border-border focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Backend Engineer">Backend Engineer</SelectItem>
                    <SelectItem value="Frontend Engineer">Frontend Engineer</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="AI/ML Engineer">AI/ML Engineer</SelectItem>
                    <SelectItem value="MLOps Engineer">MLOps Engineer</SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="weeks" className="text-sm font-medium">
                  Weeks for Preparation
                </Label>
                <Input
                  id="weeks"
                  type="number"
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  min="1"
                  max="12"
                  className="border-border focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                />
              </div>
            </div>

            <Button onClick={fetchStudyPlan} className="w-full rounded-lg shadow-md group" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Study Plan...
                </>
              ) : (
                <>
                  Generate Study Plan
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {studyPlan && (
              <Card className="mt-8 enhancv-card animate-fade-in">
                <CardHeader className="bg-accent/50 border-b border-accent/50">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Your Personalized Study Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">{renderFormattedStudyPlan()}</CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
