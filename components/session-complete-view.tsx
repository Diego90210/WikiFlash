"use client"

import { Check, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Deck } from "@/app/page"

type SessionCompleteViewProps = {
  deck: Deck | null
  stats: { very_hard: number; hard: number; good: number; easy: number; too_easy: number }
  totalCards: number
  onBackToDashboard: () => void
  onStudyAgain: () => void
}

export function SessionCompleteView({
  deck,
  stats,
  totalCards,
  onBackToDashboard,
  onStudyAgain,
}: SessionCompleteViewProps) {
  // Calculate accuracy: cards rated "good", "easy", or "too_easy" (quality >= 4)
  const successfulCards = stats.good + stats.easy + stats.too_easy
  const accuracy = totalCards > 0 ? Math.round((successfulCards / totalCards) * 100) : 0

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-card border-border shadow-xl">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-2 text-foreground">Great work!</h2>
              <p className="text-lg text-muted-foreground">Session Complete</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Cards Reviewed</p>
                <p className="text-4xl font-bold text-foreground">{totalCards}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Accuracy</p>
                <p className="text-4xl font-bold text-primary">{accuracy}%</p>
              </div>
            </div>

            <div className="mb-10 p-6 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                Performance Breakdown
              </h3>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <div className="text-xl font-bold text-red-600 mb-1">{stats.very_hard}</div>
                  <div className="text-xs text-muted-foreground">Very Hard</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-500 mb-1">{stats.hard}</div>
                  <div className="text-xs text-muted-foreground">Hard</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-500 mb-1">{stats.good}</div>
                  <div className="text-xs text-muted-foreground">Good</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-500 mb-1">{stats.easy}</div>
                  <div className="text-xs text-muted-foreground">Easy</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-500 mb-1">{stats.too_easy}</div>
                  <div className="text-xs text-muted-foreground">Too Easy</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={onBackToDashboard}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Dashboard
              </Button>
              {deck && deck.dueCount > 0 && (
                <Button size="lg" variant="outline" onClick={onStudyAgain} className="w-full bg-transparent">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  {deck.dueCount > totalCards ? `Study More Cards (${deck.dueCount - totalCards} remaining)` : `Continue Studying (${deck.dueCount} cards due)`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
