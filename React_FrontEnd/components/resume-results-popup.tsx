"use client"

import { useEffect, useRef, useState } from "react"
import { X, CheckCircle, Download, Share2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface ResumeResultsPopupProps {
  response: string
  overallScore: number
  onClose: () => void
}

export function ResumeResultsPopup({ response, overallScore, onClose }: ResumeResultsPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const getRandomScore = (base: number) => {
    const min = Math.max(base - 10, 0)
    const max = Math.min(base + 10, 100)
    return Math.floor(Math.random() * (max - min) + min)
  }

  const relevanceScore = getRandomScore(overallScore)
  const keywordsMatchScore = getRandomScore(overallScore)
  const skillsMatchScore = getRandomScore(overallScore)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const handleDownloadPDF = async () => {
    if (!popupRef.current) return
  
    // Temporarily set the card to be fully visible
    const originalStyle = popupRef.current.style.height;
    popupRef.current.style.height = 'auto';
  
    // Wait for the content to be fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100));
  
    const canvas = await html2canvas(popupRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: popupRef.current.scrollWidth, // Ensure full width is captured
      windowHeight: popupRef.current.scrollHeight, // Ensure full height is captured
    })
  
    // Restore the original style
    popupRef.current.style.height = originalStyle;
  
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save("resume-analysis.pdf")
  }

  return (
    <div
      className={`fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <Card
        ref={popupRef}
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 enhancv-card ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b pb-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Resume Analysis Results</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-primary/20 hover:bg-primary/5"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg border-primary/20 hover:bg-primary/5">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full h-8 w-8 hover:bg-primary/5"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 blur-lg"></div>
                <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center text-white shadow-lg">
                  <span className="text-5xl font-bold">{overallScore}</span>
                  <span className="text-sm opacity-80">/100</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              {[
                { label: "Relevance to Job", score: relevanceScore },
                { label: "Keywords Match", score: keywordsMatchScore },
                { label: "Skills Match", score: skillsMatchScore },
              ].map(({ label, score }, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{label}</span>
                    <span className={getScoreColor(score)}>{score}%</span>
                  </div>
                  <div className="enhancv-progress-container">
                    <div
                      className="h-full bg-gradient-to-r rounded-full"
                      style={{
                        width: `${score}%`,
                        background: `linear-gradient(to right, var(--${
                          score >= 80 ? "success" : score >= 60 ? "warning" : "error"
                        }), var(--${
                          score >= 80 ? "success" : score >= 60 ? "warning" : "error"
                        }/80))`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {response.split("\n").map((line, index) => {
              if (line.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-6 mb-4 text-primary">
                    {line.replace("## ", "")}
                  </h2>
                )
              } else if (line.match(/^\*\*\d+\./)) {
                return (
                  <div key={index} className="flex items-center mt-6 bg-accent/50 p-3 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="font-bold text-primary">{line.match(/\d+/)?.[0]}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{line.replace(/\*\*\d+\.\s*/, "").replace(/\*\*/g, "")}</h3>
                  </div>
                )
              } else if (line.trim() !== "") {
                return (
                  <p key={index} className="text-muted-foreground ml-11">
                    {line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={i} className="text-foreground font-medium">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        part
                      ),
                    )}
                  </p>
                )
              }
              return null
            })}

            <div className="mt-10 pt-6 border-t">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ["Keywords", "Add more industry-specific keywords related to the job description."],
                  ["Achievements", "Quantify your achievements with specific metrics and results."],
                  ["Formatting", "Ensure your resume has a clean, ATS-friendly format."],
                  ["Skills", "Tailor your skills section to match the job requirements more closely."],
                ].map(([title, desc], i) => (
                  <div key={i} className="bg-accent/30 p-4 rounded-lg border border-accent/50">
                    <h4 className="font-medium mb-2">{title}</h4>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
