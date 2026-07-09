"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
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
import { useTranslations } from "@/lib/language/use-translations"
import { useLanguage } from "@/lib/language/context"
import { useCardTranslation } from "@/lib/translation/use-card-translation"
import type { Deck, Flashcard } from "@/app/page"
import type { QuestionType } from "@/lib/ai/prompts"
import { updateCard as updateCardInDB } from "@/lib/supabase/cards"
import { updateCard, mapRatingToQuality } from "@/lib/spaced-repetition/sm2"
import { saveStudySessionState, clearStudySessionState } from "@/lib/study-session-storage"

type StudySessionViewProps = {
  deck: Deck | null
  cards: Flashcard[]
  onComplete: (stats: { very_hard: number; hard: number; good: number; easy: number; too_easy: number }) => void
  onExit: () => void
  initialIndex?: number
  initialStats?: { very_hard: number; hard: number; good: number; easy: number; too_easy: number }
}

export function StudySessionView({ deck, cards, onComplete, onExit, initialIndex = 0, initialStats = { very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 } }: StudySessionViewProps) {
  const t = useTranslations()
  const { language } = useLanguage()
  const { translatedCards, isTranslating } = useCardTranslation(cards, deck?.language)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [showAnswer, setShowAnswer] = useState(false)
  const [stats, setStats] = useState(initialStats)
  const [exitDialog, setExitDialog] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Use translated cards if available, otherwise use original
  const displayCards = translatedCards.length > 0 ? translatedCards : cards
  const currentCard = displayCards[currentIndex]
  const progress = ((currentIndex + 1) / displayCards.length) * 100

  
  const handleShowAnswer = () => {
    setFlipping(true)
    setTimeout(() => {
      setShowAnswer(true)
      setFlipping(false)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent, rating: "very_hard" | "hard" | "good" | "easy" | "too_easy") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleRating(rating)
    }
  }

  const handleExitWithProgress = () => {
    if (deck && displayCards.length > 0) {
      // Save the current session state
      saveStudySessionState({
        deckId: deck.id,
        currentCardIndex: currentIndex,
        totalCards: displayCards.length,
        stats: stats,
        cardIds: displayCards.map(card => card.id),
        timestamp: Date.now()
      })
    }
    onExit()
  }

  const handleRating = async (rating: "very_hard" | "hard" | "good" | "easy" | "too_easy") => {
    if (!currentCard || isSaving) return

    setIsSaving(true)
    const newStats = { ...stats, [rating]: stats[rating] + 1 }
    setStats(newStats)

    try {
      // Find the original card (not translated) to save progress
      const originalCard = cards.find(c => c.id === currentCard.id) || currentCard
      
      // Get current card SM-2 data (with defaults for new cards)
      const cardData = {
        ease_factor: originalCard.ease_factor ?? 2.5,
        interval: originalCard.interval ?? 0,
        repetitions: originalCard.repetitions ?? 0,
        next_review: originalCard.next_review ?? new Date().toISOString().split('T')[0],
      }

      // Apply SM-2 algorithm
      const quality = mapRatingToQuality(rating)
      const updatedData = updateCard(cardData, quality)

      // Save to Supabase using original card ID
      await updateCardInDB(originalCard.id, updatedData)

      // Move to next card or complete session
      if (currentIndex < displayCards.length - 1) {
        setFlipping(true)
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1)
          setShowAnswer(false)
          setFlipping(false)
          setIsSaving(false)
        }, 150)
      } else {
        setIsSaving(false)
        // Clear saved session state when completing normally
        clearStudySessionState()
        onComplete(newStats)
      }
    } catch (error) {
      console.error("Failed to update card:", error)
      setIsSaving(false)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        toast.error("Network error", {
          description: "Unable to save your progress. Please check your internet connection. Your progress will be saved when you're back online.",
          duration: 5000,
        })
      } else {
        toast.error("Failed to save progress", {
          description: errorMessage,
        })
      }
      
      // Don't move to next card if save failed - let user retry
      // But we've already updated stats, so we'll continue anyway
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground" aria-live="polite" aria-atomic="true">
              {t.cardOf} {currentIndex + 1} {language === 'es' ? 'de' : 'of'} {displayCards.length}
              {isTranslating && <span className="ml-2 text-xs">({t.loading}...)</span>}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setExitDialog(true)} 
              className="h-9 w-9"
              aria-label={t.exitStudySession}
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t.exitStudySession}</span>
            </Button>
          </div>
          <Progress value={progress} className="h-2" aria-label={`Study progress: ${Math.round(progress)}% complete`} />
        </div>
      </header>

      {/* Card Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <Card
            className={`bg-card border-border shadow-2xl min-h-[400px] flex items-center justify-center transition-all ${
              flipping ? "opacity-0" : "opacity-100"
            }`}
            role="region"
            aria-label="Flashcard"
          >
            <CardContent className="p-12 text-center w-full">
              {!showAnswer ? (
                <div className="space-y-8">
                  <div>
                    {currentCard?.question_type && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                        currentCard.question_type === 'recall' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : currentCard.question_type === 'comparison' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : currentCard.question_type === 'causal' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        : currentCard.question_type === 'socratic' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {currentCard.question_type === 'recall' ? t.typeRecall
                          : currentCard.question_type === 'comparison' ? t.typeComparison
                          : currentCard.question_type === 'causal' ? t.typeCausal
                          : currentCard.question_type === 'socratic' ? t.typeSocratic
                          : t.typePractical}
                      </span>
                    )}
                    <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4" aria-hidden="true">{t.question}</p>
                    <h2 className="text-3xl font-bold text-foreground leading-relaxed text-balance" id="card-question">
                      {currentCard?.question}
                    </h2>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleShowAnswer}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-12"
                    aria-label="Show answer to the question"
                  >
                    {t.showAnswer}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4" aria-hidden="true">{t.answer}</p>
                    <p className="text-2xl text-foreground leading-relaxed text-pretty" id="card-answer" aria-labelledby="card-question">
                      {currentCard?.answer}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Buttons - SM-2 5-point scale */}
          {showAnswer && (
            <div 
              className="mt-8 grid grid-cols-5 gap-2"
              role="group"
              aria-label="Rate your recall of this card"
            >
              <Button
                size="lg"
                onClick={() => handleRating("very_hard")}
                onKeyDown={(e) => handleKeyDown(e, "very_hard")}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 text-white h-16 text-sm disabled:opacity-50"
                aria-label="Very Hard - Complete failure, card resets"
              >
                {isSaving ? "..." : t.veryHard}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("hard")}
                onKeyDown={(e) => handleKeyDown(e, "hard")}
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white h-16 text-sm disabled:opacity-50"
                aria-label="Hard - Correct with serious difficulty"
              >
                {isSaving ? "..." : t.hard}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("good")}
                onKeyDown={(e) => handleKeyDown(e, "good")}
                disabled={isSaving}
                className="bg-yellow-500 hover:bg-yellow-600 text-white h-16 text-sm disabled:opacity-50"
                aria-label="Good - Correct after hesitation"
              >
                {isSaving ? "..." : t.good}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("easy")}
                onKeyDown={(e) => handleKeyDown(e, "easy")}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600 text-white h-16 text-sm disabled:opacity-50"
                aria-label="Easy - Perfect recall"
              >
                {isSaving ? "..." : t.easy}
              </Button>
              <Button
                size="lg"
                onClick={() => handleRating("too_easy")}
                onKeyDown={(e) => handleKeyDown(e, "too_easy")}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white h-16 text-sm disabled:opacity-50"
                aria-label="Too Easy - Perfect recall, too easy"
              >
                {isSaving ? "..." : t.tooEasy}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Exit Confirmation Dialog */}
      <Dialog open={exitDialog} onOpenChange={setExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.exitStudySessionTitle}</DialogTitle>
            <DialogDescription>{t.exitStudySessionDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitDialog(false)} aria-label="Continue studying session">
              {t.continueStudying}
            </Button>
            <Button variant="destructive" onClick={handleExitWithProgress} aria-label="Exit study session and return to dashboard">
              {t.exit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
