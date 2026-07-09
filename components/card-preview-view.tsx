"use client"

import { useState } from "react"
import { ArrowLeft, Edit2, Trash2, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "@/lib/language/use-translations"
import type { Deck, Flashcard } from "@/app/page"

type CardPreviewViewProps = {
  deck: Deck | null
  cards: Flashcard[]
  onSave: () => void
  onEditCard: (cardId: string, question: string, answer: string) => void
  onDeleteCard: (cardId: string) => void
  onRegenerate: () => void
  isSaving?: boolean
}

const TYPE_ORDER = ['recall', 'comparison', 'causal', 'socratic', 'practical'] as const

const TYPE_COLORS: Record<string, string> = {
  recall: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  comparison: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  causal: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  socratic: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  practical: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

function getTypeLabel(type: string, t: ReturnType<typeof useTranslations>): string {
  switch (type) {
    case 'recall': return t.typeRecall
    case 'comparison': return t.typeComparison
    case 'causal': return t.typeCausal
    case 'socratic': return t.typeSocratic
    case 'practical': return t.typePractical
    default: return type
  }
}

export function CardPreviewView({ deck, cards, onSave, onEditCard, onDeleteCard, onRegenerate, isSaving = false }: CardPreviewViewProps) {
  const t = useTranslations()
  const [editDialog, setEditDialog] = useState<{ open: boolean; card: Flashcard | null }>({
    open: false,
    card: null,
  })
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")

  const handleEdit = () => {
    if (editDialog.card) {
      onEditCard(editDialog.card.id, editQuestion, editAnswer)
      setEditDialog({ open: false, card: null })
    }
  }

  // Group cards by type for visual organization
  const grouped = new Map<string, Flashcard[]>()
  for (const card of cards) {
    const type = card.question_type || 'recall'
    if (!grouped.has(type)) grouped.set(type, [])
    grouped.get(type)!.push(card)
  }
  const hasMultipleTypes = grouped.size > 1

  const renderCard = (card: Flashcard) => (
    <Card key={card.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium text-foreground leading-relaxed text-balance">
            {card.question}
          </CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setEditDialog({ open: true, card })
                setEditQuestion(card.question)
                setEditAnswer(card.answer)
              }}
              aria-label={`${t.editCard}: ${card.question}`}
            >
              <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{t.editCard}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDeleteCard(card.id)}
              aria-label={`${t.deleteCard}: ${card.question}`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{t.deleteCard}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[card.question_type || 'recall'] || TYPE_COLORS.recall}`}>
            {getTypeLabel(card.question_type || 'recall', t)}
          </span>
          <span className="text-xs text-muted-foreground">{grouped.get(card.question_type || 'recall')?.indexOf(card) !== undefined ? `${(grouped.get(card.question_type || 'recall')?.indexOf(card) ?? 0) + 1}/${grouped.get(card.question_type || 'recall')?.length}` : ''}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{card.answer}</p>
      </CardContent>
    </Card>
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={onRegenerate} className="mb-6" aria-label={t.goBackToRegenerate}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          {t.back}
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-foreground">{t.reviewYourFlashcards}</h2>
          <p className="text-muted-foreground">
            {cards.length} {t.cardsGeneratedFor} {deck?.name}
          </p>
        </div>

        {hasMultipleTypes ? (
          // Grouped by type
          <div className="space-y-8 mb-8">
            {TYPE_ORDER.filter(type => grouped.has(type)).map(type => (
              <div key={type}>
                <h3 className={`text-lg font-semibold mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full ${TYPE_COLORS[type]}`}>
                  {getTypeLabel(type, t)}
                  <span className="text-xs opacity-70">({grouped.get(type)!.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped.get(type)!.map(renderCard)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat grid (all same type)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map(renderCard)}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onRegenerate} 
            className="w-full sm:w-auto bg-transparent"
            aria-label={t.regenerate}
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            {t.regenerate}
          </Button>
          <Button
            size="lg"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            aria-label={t.saveDeck}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                {t.loading}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                {t.saveDeck}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, card: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.editFlashcard}</DialogTitle>
            <DialogDescription>{t.modifyCardDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">{t.question}</Label>
              <Input
                id="edit-question"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                placeholder={t.enterQuestion}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-answer">{t.answer}</Label>
              <Textarea
                id="edit-answer"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                placeholder={t.enterAnswer}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialog({ open: false, card: null })}
              aria-label={t.cancel}
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={handleEdit}
              aria-label={t.saveChanges}
            >
              {t.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
