"use client"

import { useState, useEffect } from "react"
import { DashboardView } from "@/components/dashboard-view"
import { GeneratingView } from "@/components/generating-view"
import { CardPreviewView } from "@/components/card-preview-view"
import { StudySessionView } from "@/components/study-session-view"
import { SessionCompleteView } from "@/components/session-complete-view"
import { getSessionId } from "@/lib/session"
import { getDecks, createDeck, updateDeck, deleteDeck, updateDeckLastStudied } from "@/lib/supabase/decks"
import { getDueCards, getNewCards, getDueCardsCount, getNextReviewDate } from "@/lib/supabase/cards"

export type Deck = {
  id: string
  name: string
  topic: string
  cardCount: number
  dueCount: number
  lastStudied?: Date
}

export type Flashcard = {
  id: string
  question: string
  answer: string
  ease_factor?: number
  interval?: number
  repetitions?: number
  next_review?: string
}

type View = "dashboard" | "generating" | "preview" | "study" | "complete"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoadingDecks, setIsLoadingDecks] = useState(true)
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null)
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([])
  const [generatingTopic, setGeneratingTopic] = useState("")
  const [generatingCardCount, setGeneratingCardCount] = useState(20)
  const [wikipediaContent, setWikipediaContent] = useState<string | undefined>(undefined)
  const [studyStats, setStudyStats] = useState({ very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 })

  // Load decks from Supabase on mount
  useEffect(() => {
    async function loadDecks() {
      try {
        setIsLoadingDecks(true)
        const sessionId = await getSessionId()
        const fetchedDecks = await getDecks(sessionId)
        setDecks(fetchedDecks)
      } catch (error) {
        console.error("Failed to load decks:", error)
        // Continue with empty decks array
      } finally {
        setIsLoadingDecks(false)
      }
    }
    loadDecks()
  }, [])

  const handleCreateDeck = async (topic: string, cardCount: number, content?: string) => {
    if (!content) {
      alert('No content available. Please try again.')
      return
    }

    setGeneratingTopic(topic)
    setGeneratingCardCount(cardCount)
    setWikipediaContent(content)
    setCurrentView("generating")

    try {
      // Call API route to generate flashcards
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          count: cardCount,
          topic,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Failed to generate flashcards: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const generatedFlashcards = data.flashcards || []

      if (generatedFlashcards.length === 0) {
        throw new Error('No flashcards were generated. Please try again.')
      }

      // Convert to our Flashcard format with IDs
      const newCards: Flashcard[] = generatedFlashcards.map((card: { question: string; answer: string }, index: number) => ({
        id: `card-${Date.now()}-${index}`,
        question: card.question,
        answer: card.answer,
      }))

      setCurrentCards(newCards)
      setCurrentDeck({
        id: Date.now().toString(),
        name: topic,
        topic: "Generated",
        cardCount: newCards.length,
        dueCount: newCards.length,
      })
      setCurrentView("preview")
    } catch (error) {
      console.error('Error generating flashcards:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards. Please try again.'
      alert(errorMessage)
      setCurrentView("dashboard")
    }
  }

  const handleSaveDeck = async () => {
    if (!currentDeck || currentCards.length === 0) {
      return
    }

    try {
      const sessionId = await getSessionId()
      const savedDeck = await createDeck(
        currentDeck.name,
        currentDeck.topic,
        sessionId,
        currentCards
      )
      
      // Refresh decks list
      const updatedDecks = await getDecks(sessionId)
      setDecks(updatedDecks)
      setCurrentView("dashboard")
    } catch (error) {
      console.error("Failed to save deck:", error)
      alert(`Failed to save deck: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleStartStudy = async (deck: Deck) => {
    setCurrentDeck(deck)
    setStudyStats({ very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 })
    
    try {
      // STRICT SPACED REPETITION: Only show cards that are due today
      const dueCount = await getDueCardsCount(deck.id)
      
      if (dueCount === 0) {
        // No cards due - show message with next review date
        const nextReviewDate = await getNextReviewDate(deck.id)
        const nextReviewText = nextReviewDate 
          ? new Date(nextReviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'No upcoming reviews'
        
        alert(`No cards due right now!\n\nYou've reviewed everything scheduled for today.\n\nCome back tomorrow!\nNext review: ${nextReviewText}`)
        return
      }

      // Fetch due cards in SCHEDULED ORDER (oldest due first)
      // This respects the SM-2 algorithm's scheduling - no shuffling!
      const dueCards = await getDueCards(deck.id)
      
      // Optionally add new cards (never studied) - these CAN be shuffled
      // Limit to 5 new cards per session to avoid overwhelming the user
      const newCards = await getNewCards(deck.id, 5)
      
      if (dueCards.length === 0 && newCards.length === 0) {
        alert('No cards are due for review in this deck!')
        return
      }

      // Combine: DUE CARDS FIRST (scheduled order), then NEW CARDS (shuffled)
      // This ensures urgent reviews come first, then new learning
      const allCards = [...dueCards, ...newCards]

      // Convert CardRow to Flashcard format
      const cards: Flashcard[] = allCards.map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        ease_factor: card.ease_factor,
        interval: card.interval,
        repetitions: card.repetitions,
        next_review: card.next_review,
      }))

      setCurrentCards(cards)
      setCurrentView("study")
    } catch (error) {
      console.error("Failed to load cards:", error)
      alert(`Failed to load cards: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleCompleteStudy = async (stats: { very_hard: number; hard: number; good: number; easy: number; too_easy: number }) => {
    setStudyStats(stats)
    
    // Update deck's last_studied_at timestamp and refresh deck data
    if (currentDeck) {
      try {
        await updateDeckLastStudied(currentDeck.id)
        // Refresh decks list to get updated due count (cards' next_review dates changed)
        const sessionId = await getSessionId()
        const updatedDecks = await getDecks(sessionId)
        setDecks(updatedDecks)
        
        // Update current deck with fresh data (especially dueCount)
        const refreshedDeck = updatedDecks.find(d => d.id === currentDeck.id)
        if (refreshedDeck) {
          setCurrentDeck(refreshedDeck)
        }
      } catch (error) {
        console.error("Failed to update deck last studied:", error)
        // Don't block the user, just log the error
      }
    }
    
    setCurrentView("complete")
  }

  const handleDeleteDeck = async (id: string) => {
    try {
      await deleteDeck(id)
      // Refresh decks list
      const sessionId = await getSessionId()
      const updatedDecks = await getDecks(sessionId)
      setDecks(updatedDecks)
    } catch (error) {
      console.error("Failed to delete deck:", error)
      alert(`Failed to delete deck: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleRenameDeck = async (id: string, newName: string) => {
    try {
      await updateDeck(id, newName)
      // Refresh decks list
      const sessionId = await getSessionId()
      const updatedDecks = await getDecks(sessionId)
      setDecks(updatedDecks)
    } catch (error) {
      console.error("Failed to rename deck:", error)
      alert(`Failed to rename deck: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleEditCard = (cardId: string, question: string, answer: string) => {
    setCurrentCards(currentCards.map((card) => (card.id === cardId ? { ...card, question, answer } : card)))
  }

  const handleDeleteCard = (cardId: string) => {
    setCurrentCards(currentCards.filter((card) => card.id !== cardId))
    if (currentDeck) {
      setCurrentDeck({ ...currentDeck, cardCount: currentDeck.cardCount - 1 })
    }
  }

  return (
    <main className="min-h-screen">
      {currentView === "dashboard" && (
        <DashboardView
          decks={decks}
          onCreateDeck={handleCreateDeck}
          onStudyDeck={handleStartStudy}
          onDeleteDeck={handleDeleteDeck}
          onRenameDeck={handleRenameDeck}
          isLoadingDecks={isLoadingDecks}
        />
      )}
      {currentView === "generating" && (
        <GeneratingView 
          topic={generatingTopic} 
          cardCount={generatingCardCount}
          onCancel={() => setCurrentView("dashboard")}
        />
      )}
      {currentView === "preview" && (
        <CardPreviewView
          deck={currentDeck}
          cards={currentCards}
          onSave={handleSaveDeck}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onRegenerate={() => setCurrentView("dashboard")}
        />
      )}
      {currentView === "study" && (
        <StudySessionView
          deck={currentDeck}
          cards={currentCards}
          onComplete={handleCompleteStudy}
          onExit={() => setCurrentView("dashboard")}
        />
      )}
      {currentView === "complete" && currentDeck && (
        <SessionCompleteView
          deck={currentDeck}
          stats={studyStats}
          totalCards={currentCards.length}
          onBackToDashboard={() => setCurrentView("dashboard")}
          onStudyAgain={async () => {
            // Check if there are more cards due before starting
            const dueCount = await getDueCardsCount(currentDeck.id)
            if (dueCount === 0) {
              const nextReviewDate = await getNextReviewDate(currentDeck.id)
              const nextReviewText = nextReviewDate 
                ? new Date(nextReviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'No upcoming reviews'
              alert(`No cards due right now!\n\nYou've reviewed everything scheduled for today.\n\nCome back tomorrow!\nNext review: ${nextReviewText}`)
              return
            }
            handleStartStudy(currentDeck)
          }}
        />
      )}
    </main>
  )
}
