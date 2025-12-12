"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

type CreateDeckViewProps = {
  onBack: () => void
  onGenerate: (topic: string, cardCount: number) => void
}

export function CreateDeckView({ onBack, onGenerate }: CreateDeckViewProps) {
  const [topic, setTopic] = useState("")
  const [cardCount, setCardCount] = useState(20)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      onGenerate(topic.trim(), cardCount)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="bg-card border-border shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-foreground text-balance">What do you want to learn?</h2>
              <p className="text-muted-foreground">Enter a topic or paste a Wikipedia URL</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-base font-medium">
                  Topic or URL
                </Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., French Revolution, Quantum Physics"
                  className="text-lg h-14 bg-background"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Try: &ldquo;Ancient Rome&rdquo;, &ldquo;Photosynthesis&rdquo;, or paste a Wikipedia link
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-count" className="text-base font-medium">
                    Number of flashcards
                  </Label>
                  <span className="text-2xl font-bold text-primary">{cardCount}</span>
                </div>
                <Slider
                  id="card-count"
                  min={5}
                  max={50}
                  step={5}
                  value={[cardCount]}
                  onValueChange={(value) => setCardCount(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 cards</span>
                  <span>50 cards</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 shadow-md"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Flashcards
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
