"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, MessageSquare } from "lucide-react"

export default function InterviewQuestions() {
  const [role, setRole] = useState("Data Scientist")
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchQuestions = async () => {
    setLoading(true)
    setError("")
    setQuestions([])
    setAnswers({})

    try {
      const response = await fetch("https://skillscan-docker.onrender.com/get-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setQuestions(data.questions)
        const initialAnswers = {}
        data.questions.forEach((qna) => {
          initialAnswers[qna.question] = qna.answer
        })
        setAnswers(initialAnswers)
      }
    } catch (err) {
      setError("Failed to fetch questions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-40 h-40 pattern-dots opacity-20"></div>
      <div className="absolute bottom-40 left-20 w-40 h-40 pattern-dots opacity-20"></div>

      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <Card className="enhancv-card">
          <CardHeader className="text-center pb-2 border-b">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Interview Questions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Get role-specific interview questions and answers to help you prepare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full sm:w-[250px] border-border focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Backend Engineer">Backend Engineer</SelectItem>
                  <SelectItem value="AI/ML Engineer">AI/ML Engineer</SelectItem>
                  <SelectItem value="MLOps Engineer">MLOps Engineer</SelectItem>
                  <SelectItem value="SDE">SDE</SelectItem>
                  <SelectItem value="Frontend Engineer">Frontend Engineer</SelectItem>
                  <SelectItem value="Fullstack Engineer">Fullstack Engineer</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                  <SelectItem value="HR Interview Questions">HR Interview Questions</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={fetchQuestions}
                disabled={loading}
                className="w-full sm:w-auto rounded-lg shadow-md group"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Fetch Questions
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-6 mt-6 animate-fade-in">
                <h2 className="text-xl font-bold text-primary flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {role} Interview Questions:
                </h2>
                <div className="space-y-6">
                  {questions.map((qna, index) => (
                    <Card key={index} className="overflow-hidden enhancv-card">
                      <CardHeader className="bg-accent py-4 border-b border-accent/50">
                        <CardTitle className="text-base font-medium flex items-start">
                          <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </span>
                          {qna.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 bg-gradient-subtle">
                        <p className="text-sm text-muted-foreground">
                          <strong>Answer:</strong> {answers[qna.question]}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
