"use client"

import { useState, useCallback, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, FileText, ArrowRight } from "lucide-react"
import { ResumeResultsPopup } from "@/components/resume-results-popup"

export default function ResumeChecker() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [analysisType, setAnalysisType] = useState("Quick Scan")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [overallScore, setOverallScore] = useState(0)

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0]
    if (file && (file.type === "application/pdf" || file.name.endsWith(".docx"))) {
      setSelectedFile(file)
      setError("")
    } else {
      setError("Invalid file type. Please upload a PDF or DOCX file.")
      setSelectedFile(null)
    }
  }, [])

  const triggerFileInput = useCallback(() => {
    document.getElementById("resume-input").click()
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      setError("Please upload a valid resume file before analyzing.")
      return
    }
  
    setLoading(true)
    setError("")
    setResponse("")
    setAnalysisComplete(false)
  
    const formData = new FormData()
    formData.append("resume", selectedFile)
    formData.append("job_description", jobDescription)
    formData.append("analysis_type", analysisType)
  
    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      })
  
      if (!res.ok) {
        throw new Error("Failed to analyze resume. Please try again.")
      }
  
      const data = await res.json()
      const formattedResponse = data.analysis || "Analysis data not found in response."
      setResponse(formattedResponse)
      setShowPopup(true)
      setAnalysisComplete(true)
    } catch (err) {
      console.error("API Error:", err)
      setError("There was an error analyzing your resume. Please check your backend server.")
    } finally {
      setLoading(false)
    }
  }, [selectedFile, jobDescription, analysisType])

  useEffect(() => {
    if (response) {
      const overallScoreMatch = response.match(/\*\*\d+\. Overall ATS Score \(out of 100\): (\d+)\*\*/)
      const overallScore = overallScoreMatch ? parseInt(overallScoreMatch[1], 10) : 0
      setOverallScore(overallScore)
    }
  }, [response])

  const closePopup = () => {
    setShowPopup(false)
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 pattern-dots opacity-30"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 pattern-dots opacity-30"></div>

      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <Card className="enhancv-card">
          <CardHeader className="text-center pb-2 border-b">
            <CardTitle className="text-2xl font-bold text-primary">Resume Analysis</CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload your resume and get detailed feedback tailored to the job description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div
              className="border-2 border-dashed border-primary/20 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors bg-accent/30 relative overflow-hidden group"
              onClick={triggerFileInput}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent w-[200%] -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Upload your resume</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                  <p className="text-xs text-muted-foreground">PDF or DOCX (Max 5MB)</p>
                </div>
              </div>
              <input id="resume-input" type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg border border-accent/50">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center">
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mr-3">
                  <X className="h-4 w-4 text-destructive" />
                </div>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="job-description" className="text-sm font-medium">
                Job Description
              </Label>
              <Textarea
                id="job-description"
                placeholder="Enter job description for more accurate analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[120px] resize-none border-border focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="analysis-type" className="text-sm font-medium">
                Analysis Type
              </Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="border-border focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quick Scan">Quick Scan</SelectItem>
                  <SelectItem value="Detailed Analysis">Detailed Analysis</SelectItem>
                  <SelectItem value="ATS Optimization">ATS Optimization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} className="w-full rounded-lg shadow-md group" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Resume
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <Card className="mt-8 enhancv-card animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4"></div>
              </div>
              <p className="text-lg font-medium mt-4">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
            </CardContent>
          </Card>
        )}

        
        {showPopup && <ResumeResultsPopup response={response} overallScore={overallScore} onClose={closePopup} />}
      </div>
    </div>
  )
}
