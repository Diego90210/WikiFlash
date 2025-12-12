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
import type { Deck, Flashcard } from "@/app/page"

type CardPreviewViewProps = {
  deck: Deck | null
  cards: Flashcard[]
  onSave: () => void
  onEditCard: (cardId: string, question: string, answer: string) => void
  onDeleteCard: (cardId: string) => void
  onRegenerate: () => void
}

export function CardPreviewView({ deck, cards, onSave, onEditCard, onDeleteCard, onRegenerate }: CardPreviewViewProps) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={onRegenerate} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-foreground">Review Your Flashcards</h2>
          <p className="text-muted-foreground">
            {cards.length} cards generated for {deck?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => (
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
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit card</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDeleteCard(card.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete card</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{card.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="lg" onClick={onRegenerate} className="w-full sm:w-auto bg-transparent">
            <RotateCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button
            size="lg"
            onClick={onSave}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Deck
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, card: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>Modify the question and answer for this card.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Question</Label>
              <Input
                id="edit-question"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                placeholder="Enter question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                placeholder="Enter answer"
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, card: null })}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
