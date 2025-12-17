"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Deck, Flashcard } from "@/app/page"
import { updateCard as updateCardInDB } from "@/lib/supabase/cards"
import { updateCard, mapRatingToQuality } from "@/lib/spaced-repetition/sm2"

type StudySessionViewProps = {
  deck: Deck | null
  cards: Flashcard[]
  onComplete: (stats: { very_hard: number; hard: number; good: number; easy: number; too_easy: number }) => void
  onExit: () => void
}

export function StudySessionView({ deck, cards, onComplete, onExit }: StudySessionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [stats, setStats] = useState({ very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 })
  const [exitDialog, setExitDialog] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  const handleShowAnswer = () => {
    setFlipping(true)
    setTimeout(() => {
      setShowAnswer(true)
      setFlipping(false)
    }, 150)
  }

  const handleRating = async (rating: "very_hard" | "hard" | "good" | "easy" | "too_easy") => {
    if (!currentCard || isSaving) return

    setIsSaving(true)
    const newStats = { ...stats, [rating]: stats[rating] + 1 }
    setStats(newStats)

    try {
      // Get current card SM-2 data (with defaults for new cards)
      const cardData = {
        ease_factor: currentCard.ease_factor ?? 2.5,
        interval: currentCard.interval ?? 0,
        repetitions: currentCard.repetitions ?? 0,
        next_review: currentCard.next_review ?? new Date().toISOString().split('T')[0],
      }

      // Apply SM-2 algorithm
      const quality = mapRatingToQuality(rating)
      const updatedData = updateCard(cardData, quality)

      // Save to Supabase
      await updateCardInDB(currentCard.id, updatedData)

      // Move to next card or complete session
      if (currentIndex < cards.length - 1) {
        setFlipping(true)
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1)
          setShowAnswer(false)
          setFlipping(false)
          setIsSaving(false)
        }, 150)
      } else {
        setIsSaving(false)
        onComplete(newStats)
      }
    } catch (error) {
      console.error("Failed to update card:", error)
      setIsSaving(false)
      alert(`Failed to save progress: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setExitDialog(true)} className="h-9 w-9">
              <X className="h-5 w-5" />
              <span className="sr-only">Exit study session</span>
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <Card
            className={`bg-card border-border shadow-2xl min-h-[400px] flex items-center justify-center transition-all ${
              flipping ? "opacity-0" : "opacity-100"
            }`}
          >
            <CardContent className="p-12 text-center w-full">
              {!showAnswer ? (
                <div className="space-y-8">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4">Question</p>
                    <h3 className="text-3xl font-bold text-foreground leading-relaxed text-balance">
                      {currentCard?.question}
                    </h3>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleShowAnswer}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-12"
                  >
                    Show Answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4">Answer</p>
                    <p className="text-2xl text-foreground leading-relaxed text-pretty">{currentCard?.answer}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Buttons - SM-2 5-point scale */}
          {showAnswer && (
            <div className="mt-8 grid grid-cols-5 gap-2">
              <Button
                size="lg"
                onClick={() => handleRating("very_hard")}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 text-white h-16 text-sm disabled:opacity-50"
                title="Complete failure - card resets"
              >
                {isSaving ? "..." : "Very Hard"}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("hard")}
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white h-16 text-sm disabled:opacity-50"
                title="Correct with serious difficulty"
              >
                {isSaving ? "..." : "Hard"}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("good")}
                disabled={isSaving}
                className="bg-yellow-500 hover:bg-yellow-600 text-white h-16 text-sm disabled:opacity-50"
                title="Correct after hesitation"
              >
                {isSaving ? "..." : "Good"}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("easy")}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600 text-white h-16 text-sm disabled:opacity-50"
                title="Perfect recall"
              >
                {isSaving ? "..." : "Easy"}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("too_easy")}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white h-16 text-sm disabled:opacity-50"
                title="Too easy - perfect recall"
              >
                {isSaving ? "..." : "Too Easy"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={exitDialog} onOpenChange={setExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Study Session?</DialogTitle>
            <DialogDescription>Cards you've already reviewed have been saved. You can continue studying later.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitDialog(false)}>
              Continue Studying
            </Button>
            <Button variant="destructive" onClick={onExit}>
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
