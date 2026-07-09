"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { DashboardView } from "@/components/dashboard-view"
import { GeneratingView } from "@/components/generating-view"
import { CardPreviewView } from "@/components/card-preview-view"
import { StudySessionView } from "@/components/study-session-view"
import { SessionCompleteView } from "@/components/session-complete-view"
import { ErrorBoundary } from "@/components/error-boundary"
import { useLanguage } from "@/lib/language/context"
import { useTranslations } from "@/lib/language/use-translations"
import { getSessionId } from "@/lib/session"
import { storeDeckLanguage, getDeckLanguage } from "@/lib/deck-language-storage"
import { getDecks, createDeck, updateDeck, deleteDeck, updateDeckLastStudied } from "@/lib/supabase/decks"
import { getDueCards, getNewCards, getDueCardsCount, getNextReviewDate } from "@/lib/supabase/cards"
import { getStudySessionState, clearStudySessionState } from "@/lib/study-session-storage"
import type { GenerationProfile } from "@/lib/ai/prompts"

export type Deck = {
  id: string
  name: string
  topic: string
  cardCount: number
  dueCount: number
  lastStudied?: Date
  language?: 'en' | 'es' // Language the deck was created in
}

export type Flashcard = {
  id: string
  question: string
  answer: string
  question_type?: string
  ease_factor?: number
  interval?: number
  repetitions?: number
  next_review?: string
}

type View = "dashboard" | "generating" | "preview" | "study" | "complete"

export default function Home() {
  const { language } = useLanguage()
  const t = useTranslations()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoadingDecks, setIsLoadingDecks] = useState(true)
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null)
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([])
  const [generatingTopic, setGeneratingTopic] = useState("")
  const [generatingCardCount, setGeneratingCardCount] = useState(20)
  const [wikipediaContent, setWikipediaContent] = useState<string | undefined>(undefined)
  const [studyStats, setStudyStats] = useState({ very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 })
  const [isSavingDeck, setIsSavingDeck] = useState(false)
  const [initialStudyIndex, setInitialStudyIndex] = useState(0)
  const [initialStudyStats, setInitialStudyStats] = useState({ very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 })

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
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        
        // Check if it's a network error
        if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
          toast.error("Network error", {
            description: "Unable to connect to the server. Please check your internet connection and try again.",
          })
        } else {
          toast.error("Failed to load decks", {
            description: "We couldn't load your flashcard decks. Please refresh the page to try again.",
          })
        }
        // Continue with empty decks array so user can still use the app
      } finally {
        setIsLoadingDecks(false)
      }
    }
    loadDecks()
  }, [])

  const handleCreateDeck = async (topic: string, cardCount: number, content?: string, deckLanguage: 'en' | 'es' = 'en', sourceLanguage?: 'en' | 'es', profile?: GenerationProfile) => {
    if (!content) {
      toast.error("No content available", {
        description: "We couldn't fetch the Wikipedia content. Please try again with a different topic or URL.",
      })
      return
    }

    setGeneratingTopic(topic)
    setGeneratingCardCount(cardCount)
    setWikipediaContent(content)
    setCurrentView("generating")

    try {
      // Debug: Log what we're sending to the API
      console.log('Generating flashcards with:', { content: content?.substring(0, 100) + '...', count: cardCount, topic, language, sourceLanguage })
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      })
      
      // Call API route to generate flashcards
      const fetchPromise = fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          count: cardCount,
          topic,
          language,
          sourceLanguage,
          profile,
        }),
      })
      
      // Race the fetch against the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      if (!response.ok) {
        let errorMessage = "Failed to generate flashcards"
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          if (response.status === 429) {
            errorMessage = "Too many requests. Please wait a moment and try again."
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again in a moment."
          } else if (response.status === 400) {
            errorMessage = "Invalid request. Please check your input and try again."
          } else {
            errorMessage = `Failed to generate flashcards: ${response.statusText}`
          }
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const generatedFlashcards = data.flashcards || []

      if (generatedFlashcards.length === 0) {
        throw new Error('No flashcards were generated. Please try again.')
      }

      // Convert to our Flashcard format with IDs
      const newCards: Flashcard[] = generatedFlashcards.map((card: { question: string; answer: string; type?: string }, index: number) => ({
        id: `card-${Date.now()}-${index}`,
        question: card.question,
        answer: card.answer,
        question_type: card.type || 'recall',
      }))

      setCurrentCards(newCards)
      setCurrentDeck({
        id: Date.now().toString(),
        name: topic,
        topic: "Generated",
        cardCount: newCards.length,
        dueCount: newCards.length,
        language: deckLanguage,
      })
      setCurrentView("preview")
    } catch (error) {
      console.error('Error generating flashcards:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards. Please try again.'
      
      // Check for timeout specifically
      if (errorMessage.includes("timeout") || errorMessage.includes("Request timeout")) {
        toast.error("Request timeout", {
          description: "The request took too long to complete. Please try again with a smaller number of cards.",
        })
      } else if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
        toast.error("Network error", {
          description: "Unable to connect to the server. Please check your internet connection and try again.",
        })
      } else if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
        toast.error("Rate limit exceeded", {
          description: "API rate limit reached. Please wait a few minutes before trying again.",
          duration: 6000,
        })
      } else {
        toast.error("Failed to generate flashcards", {
          description: errorMessage,
        })
      }
      
      setCurrentView("dashboard")
    }
  }

  const handleSaveDeck = async () => {
    if (!currentDeck || currentCards.length === 0 || isSavingDeck) {
      return
    }

    setIsSavingDeck(true)

    try {
      const sessionId = await getSessionId()
      const savedDeck = await createDeck(
        currentDeck.name,
        currentDeck.topic,
        sessionId,
        currentCards
      )
      
      // Store the deck language
      if (currentDeck.language) {
        storeDeckLanguage(savedDeck.id, currentDeck.language)
      }
      
      // Refresh decks list
      const updatedDecks = await getDecks(sessionId)
      setDecks(updatedDecks)
      setCurrentView("dashboard")
    } catch (error) {
      console.error("Failed to save deck:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        toast.error("Network error", {
          description: "Unable to save your deck. Please check your internet connection and try again.",
        })
      } else {
        toast.error("Failed to save deck", {
          description: errorMessage,
        })
      }
    } finally {
      setIsSavingDeck(false)
    }
  }

  const handleStartStudy = async (deck: Deck) => {
    setCurrentDeck(deck)
    
    // Check for saved session state first
    const savedSession = getStudySessionState(deck.id)
    
    try {
      let cards: Flashcard[] = []
      let restoredIndex = 0
      let restoredStats = { very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 }
      
      if (savedSession) {
        // Restore the saved session
        restoredIndex = savedSession.currentCardIndex
        restoredStats = savedSession.stats
        
        // Fetch the same cards that were in the saved session
        const allCardRows = await getDueCards(deck.id)
        const newCardRows = await getNewCards(deck.id, 5)
        const dueCardIds = new Set(allCardRows.map(card => card.id))
        const newCards = newCardRows.filter(card => !dueCardIds.has(card.id))
        const allCardRowsCombined = [...allCardRows, ...newCards]
        
        // Convert to Flashcard format
        const allCards = allCardRowsCombined.map((card) => ({
          id: card.id,
          question: card.question,
          answer: card.answer,
          question_type: card.question_type,
          ease_factor: card.ease_factor,
          interval: card.interval,
          repetitions: card.repetitions,
          next_review: card.next_review,
        }))
        
        // Filter to only include cards that were in the saved session
        cards = allCards.filter(card => savedSession.cardIds.includes(card.id))
        
        // Sort cards in the same order as the saved session
        cards.sort((a, b) => {
          const aIndex = savedSession.cardIds.indexOf(a.id)
          const bIndex = savedSession.cardIds.indexOf(b.id)
          return aIndex - bIndex
        })
        
        // Show a toast indicating session is being resumed
        toast.info("Resuming study session", {
          description: `Continuing from card ${restoredIndex + 1} of ${cards.length}`,
          duration: 3000,
        })
      } else {
        // Start a new session
        setStudyStats({ very_hard: 0, hard: 0, good: 0, easy: 0, too_easy: 0 })
        
        // STRICT SPACED REPETITION: Only show cards that are due today
        const dueCount = await getDueCardsCount(deck.id)
        
        if (dueCount === 0) {
          // No cards due - show message with next review date
          const nextReviewDate = await getNextReviewDate(deck.id)
          const nextReviewText = nextReviewDate 
            ? new Date(nextReviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'No upcoming reviews'
          
          toast.info(t.allCaughtUp, {
            description: `${t.allCaughtUpMessage} ${t.comeBackTomorrow} ${t.nextReview} ${nextReviewText}`,
            duration: 5000,
          })
          return
        }

        // Fetch due cards in SCHEDULED ORDER (oldest due first)
        // This respects the SM-2 algorithm's scheduling - no shuffling!
        const dueCards = await getDueCards(deck.id)
        
        // Optionally add new cards (never studied) - these CAN be shuffled
        // Limit to 5 new cards per session to avoid overwhelming the user
        const allNewCards = await getNewCards(deck.id, 5)
        
        // Filter out cards that are already in dueCards to avoid duplicates
        // (New cards with next_review = today appear in both lists)
        const dueCardIds = new Set(dueCards.map(card => card.id))
        const newCards = allNewCards.filter(card => !dueCardIds.has(card.id))

        // Pedagogical ordering for new cards: group by type, maintain shuffle within each group
        const TYPE_ORDER = ['recall', 'comparison', 'causal', 'socratic', 'practical']
        const grouped = new Map<string, typeof newCards>()
        for (const card of newCards) {
          const t = card.question_type || 'recall'
          if (!grouped.has(t)) grouped.set(t, [])
          grouped.get(t)!.push(card)
        }
        const sortedNewCards = TYPE_ORDER.flatMap(t => grouped.get(t) || [])
        
        if (dueCards.length === 0 && newCards.length === 0) {
          toast.info(t.noCardsAvailable, {
            description: t.noCardsDue,
          })
          return
        }

        // Combine: DUE CARDS FIRST (scheduled order), then NEW CARDS (pedagogical order)
        const allCards = [...dueCards, ...sortedNewCards]

        // Convert CardRow to Flashcard format
        cards = allCards.map((card) => ({
          id: card.id,
          question: card.question,
          answer: card.answer,
          question_type: card.question_type,
          ease_factor: card.ease_factor,
          interval: card.interval,
          repetitions: card.repetitions,
          next_review: card.next_review,
        }))
      }

      setCurrentCards(cards)
      setStudyStats(restoredStats)
      setInitialStudyIndex(restoredIndex)
      setInitialStudyStats(restoredStats)
      setCurrentView("study")
      
    } catch (error) {
      console.error("Failed to load cards:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        toast.error("Network error", {
          description: "Unable to load cards. Please check your internet connection and try again.",
        })
      } else {
        toast.error("Failed to load cards", {
          description: errorMessage,
        })
      }
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
        // Don't block the user, but show a non-intrusive error
        toast.error("Failed to update progress", {
          description: "Your study progress was saved, but we couldn't update the timestamp. This won't affect your learning.",
          duration: 3000,
        })
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        toast.error("Network error", {
          description: "Unable to delete the deck. Please check your internet connection and try again.",
        })
      } else {
        toast.error("Failed to delete deck", {
          description: errorMessage,
        })
      }
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        toast.error("Network error", {
          description: "Unable to rename the deck. Please check your internet connection and try again.",
        })
      } else {
        toast.error("Failed to rename deck", {
          description: errorMessage,
        })
      }
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
    <ErrorBoundary>
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
          isSaving={isSavingDeck}
        />
      )}
      {currentView === "study" && (
        <StudySessionView
          deck={currentDeck}
          cards={currentCards}
          onComplete={handleCompleteStudy}
          onExit={() => setCurrentView("dashboard")}
          initialIndex={initialStudyIndex}
          initialStats={initialStudyStats}
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
                : t.noUpcomingReviews
              toast.info(t.allCaughtUp, {
                description: `${t.allCaughtUpMessage} ${t.comeBackTomorrow} ${t.nextReview} ${nextReviewText}`,
                duration: 5000,
              })
              return
            }
            handleStartStudy(currentDeck)
          }}
        />
      )}
      </main>
    </ErrorBoundary>
  )
}
