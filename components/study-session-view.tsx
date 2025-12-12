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

type StudySessionViewProps = {
  deck: Deck | null
  cards: Flashcard[]
  onComplete: (stats: { hard: number; good: number; easy: number }) => void
  onExit: () => void
}

export function StudySessionView({ deck, cards, onComplete, onExit }: StudySessionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [stats, setStats] = useState({ hard: 0, good: 0, easy: 0 })
  const [exitDialog, setExitDialog] = useState(false)
  const [flipping, setFlipping] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  const handleShowAnswer = () => {
    setFlipping(true)
    setTimeout(() => {
      setShowAnswer(true)
      setFlipping(false)
    }, 150)
  }

  const handleRating = (rating: "hard" | "good" | "easy") => {
    setStats({ ...stats, [rating]: stats[rating] + 1 })

    if (currentIndex < cards.length - 1) {
      setFlipping(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
        setFlipping(false)
      }, 150)
    } else {
      onComplete({ ...stats, [rating]: stats[rating] + 1 })
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

          {/* Rating Buttons */}
          {showAnswer && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Button
                size="lg"
                onClick={() => handleRating("hard")}
                className="bg-red-500 hover:bg-red-600 text-white h-16 text-lg"
              >
                Hard
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("good")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white h-16 text-lg"
              >
                Good
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("easy")}
                className="bg-green-500 hover:bg-green-600 text-white h-16 text-lg"
              >
                Easy
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
            <DialogDescription>Your progress will not be saved if you exit now.</DialogDescription>
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
