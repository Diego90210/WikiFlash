"use client"

import { BookOpen, Plus, MoreVertical, Edit2, Trash2, Clock, Sparkles, Brain } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { AbstractShapes } from "./abstract-shapes"
import type { Deck } from "@/app/page"
import { useState } from "react"

type DashboardViewProps = {
  decks: Deck[]
  onCreateDeck: (topic: string, cardCount: number) => void
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
  const [createDialog, setCreateDialog] = useState(false)
  const [wikipediaTopic, setWikipediaTopic] = useState("")
  const [selectedCardCount, setSelectedCardCount] = useState<number>(20)
  const [customCardCount, setCustomCardCount] = useState("")
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

  const handleCreateDeck = () => {
    if (wikipediaTopic.trim()) {
      const count = customCardCount ? Number.parseInt(customCardCount) : selectedCardCount
      onCreateDeck(wikipediaTopic.trim(), count)
      setCreateDialog(false)
      setWikipediaTopic("")
      setCustomCardCount("")
      setSelectedCardCount(20)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative shapes scattered in the background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Teal flower - top left */}
        <div className="absolute top-20 left-10 opacity-10 dark:opacity-5 animate-float">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="32" fill="currentColor" className="text-accent" opacity="0.8" />
            <circle cx="50" cy="30" r="10" fill="currentColor" className="text-accent" />
            <circle cx="70" cy="50" r="10" fill="currentColor" className="text-accent" />
            <circle cx="50" cy="70" r="10" fill="currentColor" className="text-accent" />
            <circle cx="30" cy="50" r="10" fill="currentColor" className="text-accent" />
          </svg>
        </div>

        {/* Pink spiral - top right */}
        <div
          className="absolute top-32 right-20 opacity-10 dark:opacity-5 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-secondary"
            />
            <circle cx="50" cy="50" r="3" fill="currentColor" className="text-secondary" />
          </svg>
        </div>

        {/* Orange asterisk - middle left */}
        <div
          className="absolute top-1/2 left-16 opacity-10 dark:opacity-5 animate-float"
          style={{ animationDelay: "2s" }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="24"
              y="13"
              width="12"
              height="34"
              fill="currentColor"
              className="text-primary"
              rx="1"
              transform="rotate(0 30 30)"
            />
            <rect
              x="24"
              y="13"
              width="12"
              height="34"
              fill="currentColor"
              className="text-primary"
              rx="1"
              transform="rotate(45 30 30)"
            />
            <rect
              x="24"
              y="13"
              width="12"
              height="34"
              fill="currentColor"
              className="text-primary"
              rx="1"
              transform="rotate(90 30 30)"
            />
            <rect
              x="24"
              y="13"
              width="12"
              height="34"
              fill="currentColor"
              className="text-primary"
              rx="1"
              transform="rotate(135 30 30)"
            />
            <circle cx="30" cy="30" r="6" fill="currentColor" className="text-primary" opacity="0.8" />
          </svg>
        </div>

        {/* Yellow star - bottom right */}
        <div
          className="absolute bottom-32 right-32 opacity-10 dark:opacity-5 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="35,15 43,28 58,30 45,40 50,55 35,45 20,55 25,40 12,30 27,28"
              fill="currentColor"
              className="text-accent"
            />
          </svg>
        </div>

        {/* Teal arches - bottom left */}
        <div
          className="absolute bottom-24 left-24 opacity-10 dark:opacity-5 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 10 50 Q 50 10 90 50"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              className="text-secondary"
            />
            <path
              d="M 20 45 Q 50 20 80 45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-secondary"
            />
            <path
              d="M 30 40 Q 50 30 70 40"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="text-secondary"
            />
          </svg>
        </div>

        {/* Additional scattered shapes for depth */}
        <div
          className="absolute top-2/3 right-1/4 opacity-10 dark:opacity-5 animate-float"
          style={{ animationDelay: "3s" }}
        >
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
            <circle cx="25" cy="25" r="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
          </svg>
        </div>

        <div
          className="absolute top-1/4 left-1/3 opacity-10 dark:opacity-5 animate-float"
          style={{ animationDelay: "2.5s" }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="20,5 25,15 35,17 27,25 30,35 20,28 10,35 13,25 5,17 15,15"
              fill="currentColor"
              className="text-accent"
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-50">
        <div className="container mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/wikiflash_logo_normal.png" alt="WikiFlash" className="h-10 w-10 object-contain dark:hidden" />
            <img src="/wikiflash_logo_inverted_colors.png" alt="WikiFlash" className="h-10 w-10 object-contain hidden dark:block" />
            <h1 className="text-2xl font-bold text-foreground">WikiFlash</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            {/* Abstract Shapes Visual - Enhanced */}
            <AbstractShapes />

            {/* Hero Text */}
            <div className="text-center max-w-2xl mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-tight">
                Turn Wikipedia into Flashcards
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground/70 leading-relaxed">
                Master any topic with AI-generated flashcards and spaced repetition
              </p>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={() => setCreateDialog(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Create Your First Deck
            </Button>

            {/* How It Works Section */}
            <div className="w-full max-w-5xl mt-20">
              <h3 className="text-2xl md:text-3xl font-semibold text-center mb-12 text-foreground">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-foreground">Enter Topic</h4>
                  <p className="text-sm text-muted-foreground/70">Type any Wikipedia subject or paste a URL</p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-secondary" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-foreground">AI Generates</h4>
                  <p className="text-sm text-muted-foreground/70">Smart flashcards created in seconds</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-accent" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-foreground">Study & Master</h4>
                  <p className="text-sm text-muted-foreground/70">Learn with proven spaced repetition</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Your Decks</h2>
              <Button
                onClick={() => setCreateDialog(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Deck
              </Button>
            </div>

            {/* Decks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <Card
                  key={deck.id}
                  className={`bg-card border-2 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${
                    deck.dueCount > 0 ? "border-accent/50" : "border-border"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-bold text-balance flex-1 pr-2">{deck.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground/40 hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-lg shadow-lg">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameDialog({ open: true, deck })
                              setNewName(deck.name)
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Rename Deck
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, deck })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Deck
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-sm">from Wikipedia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {deck.cardCount} cards
                      </span>
                      {deck.dueCount > 0 && (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-accent/25 dark:bg-accent/15 text-accent dark:text-accent-foreground rounded-lg font-medium">
                          <Clock className="h-4 w-4" />
                          {deck.dueCount} due
                        </span>
                      )}
                    </div>

                    {/* Last Studied */}
                    {deck.lastStudied && (
                      <p className="text-xs text-muted-foreground/50 mb-4">
                        Last studied: {deck.lastStudied.toLocaleDateString()}
                      </p>
                    )}

                    <Button
                      onClick={() => onStudyDeck(deck)}
                      className={`w-full h-11 rounded-xl font-semibold transition-all duration-200 ${
                        deck.dueCount > 0
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                          : "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm hover:shadow-md"
                      }`}
                    >
                      {deck.dueCount > 0 ? "Study Now" : "Review"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold">Create New Deck</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Wikipedia Input */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base font-medium">
                What do you want to learn?
              </Label>
              <Input
                id="topic"
                placeholder="Enter topic or paste Wikipedia URL"
                value={wikipediaTopic}
                onChange={(e) => setWikipediaTopic(e.target.value)}
                className="h-13 text-base rounded-xl border-2 focus-visible:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && handleCreateDeck()}
              />
              <p className="text-sm text-muted-foreground/50">e.g., Ancient Rome, Photosynthesis, Machine Learning</p>
            </div>

            {/* Card Count Selector */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Number of flashcards:</Label>
              <div className="flex flex-wrap items-center gap-3">
                {[10, 20, 30].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setSelectedCardCount(count)
                      setCustomCardCount("")
                    }}
                    className={`w-20 h-11 rounded-xl font-semibold text-base transition-all duration-200 border-2 ${
                      selectedCardCount === count && !customCardCount
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-transparent border-muted text-foreground hover:border-primary/50 hover:scale-105"
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom" className="text-sm font-medium text-muted-foreground">
                    Custom:
                  </Label>
                  <Input
                    id="custom"
                    type="number"
                    min="5"
                    max="50"
                    placeholder="15"
                    value={customCardCount}
                    onChange={(e) => {
                      setCustomCardCount(e.target.value)
                      if (e.target.value) {
                        setSelectedCardCount(0)
                      }
                    }}
                    className="w-24 h-11 text-base rounded-xl border-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8">
            <Button
              onClick={handleCreateDeck}
              disabled={!wikipediaTopic.trim()}
              className="w-full h-13 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Generate Flashcards
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, deck: null })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Rename Deck</DialogTitle>
            <DialogDescription>Enter a new name for this deck.</DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Deck name"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open, deck: null })} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleRename} className="rounded-xl">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, deck: null })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              This will delete &ldquo;{deleteDialog.deck?.name}&rdquo; and all {deleteDialog.deck?.cardCount} cards.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open, deck: null })} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
