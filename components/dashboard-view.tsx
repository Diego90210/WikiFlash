"use client"

import { BookOpen, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Deck } from "@/app/page"
import { useState } from "react"

type DashboardViewProps = {
  decks: Deck[]
  onCreateDeck: () => void
  onStudyDeck: (deck: Deck) => void
  onDeleteDeck: (id: string) => void
  onRenameDeck: (id: string, newName: string) => void
}

export function DashboardView({ decks, onCreateDeck, onStudyDeck, onDeleteDeck, onRenameDeck }: DashboardViewProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; deck: Deck | null }>({
    open: false,
    deck: null,
  })
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; deck: Deck | null }>({
    open: false,
    deck: null,
  })
  const [newName, setNewName] = useState("")

  const handleRename = () => {
    if (renameDialog.deck && newName.trim()) {
      onRenameDeck(renameDialog.deck.id, newName.trim())
      setRenameDialog({ open: false, deck: null })
      setNewName("")
    }
  }

  const handleDelete = () => {
    if (deleteDialog.deck) {
      onDeleteDeck(deleteDialog.deck.id)
      setDeleteDialog({ open: false, deck: null })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">WikiFlash</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">My Decks</h2>
            <p className="text-muted-foreground mt-1">Manage and study your flashcard decks</p>
          </div>
          {decks.length > 0 && (
            <Button onClick={onCreateDeck} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-5 w-5" />
              Create Deck
            </Button>
          )}
        </div>

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">No decks yet</h3>
              <p className="text-muted-foreground mb-6">Create your first deck to start learning!</p>
              <Button
                onClick={onCreateDeck}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Deck
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Card key={deck.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold mb-1 text-balance">{deck.name}</CardTitle>
                      <CardDescription>{deck.topic}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setRenameDialog({ open: true, deck })
                            setNewName(deck.name)
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, deck })}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span>{deck.cardCount} cards</span>
                    {deck.dueCount > 0 && (
                      <span className="px-2 py-1 bg-accent text-accent-foreground rounded-md font-medium">
                        {deck.dueCount} due
                      </span>
                    )}
                  </div>
                  {deck.lastStudied && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Last studied: {deck.lastStudied.toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    onClick={() => onStudyDeck(deck)}
                    className={`w-full ${
                      deck.dueCount > 0
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    }`}
                  >
                    {deck.dueCount > 0 ? "Study Now" : "Review Deck"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, deck: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Deck</DialogTitle>
            <DialogDescription>Enter a new name for this deck.</DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Deck name"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, deck: null })}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, deck: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              This will delete &ldquo;{deleteDialog.deck?.name}&rdquo; and all {deleteDialog.deck?.cardCount} cards.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, deck: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
