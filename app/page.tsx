"use client"

import { useState } from "react"
import { DashboardView } from "@/components/dashboard-view"
import { CreateDeckView } from "@/components/create-deck-view"
import { GeneratingView } from "@/components/generating-view"
import { CardPreviewView } from "@/components/card-preview-view"
import { StudySessionView } from "@/components/study-session-view"
import { SessionCompleteView } from "@/components/session-complete-view"

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
}

type View = "dashboard" | "create" | "generating" | "preview" | "study" | "complete"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: "1",
      name: "French Revolution",
      topic: "World History",
      cardCount: 20,
      dueCount: 8,
      lastStudied: new Date("2025-01-10"),
    },
    {
      id: "2",
      name: "Quantum Physics",
      topic: "Physics",
      cardCount: 15,
      dueCount: 0,
      lastStudied: new Date("2025-01-11"),
    },
    {
      id: "3",
      name: "Renaissance Art",
      topic: "Art History",
      cardCount: 25,
      dueCount: 12,
      lastStudied: new Date("2025-01-09"),
    },
  ])
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null)
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([])
  const [generatingTopic, setGeneratingTopic] = useState("")
  const [studyStats, setStudyStats] = useState({ hard: 0, good: 0, easy: 0 })

  const handleCreateDeck = (topic: string, cardCount: number) => {
    setGeneratingTopic(topic)
    setCurrentView("generating")

    // Simulate generation delay
    setTimeout(() => {
      const newCards: Flashcard[] = Array.from({ length: cardCount }, (_, i) => ({
        id: `card-${i}`,
        question: `Sample question ${i + 1} about ${topic}`,
        answer: `This is the answer to question ${i + 1}. It contains detailed information about the topic that helps you learn and remember key concepts.`,
      }))
      setCurrentCards(newCards)
      setCurrentDeck({
        id: Date.now().toString(),
        name: topic,
        topic: "Generated",
        cardCount,
        dueCount: cardCount,
      })
      setCurrentView("preview")
    }, 3000)
  }

  const handleSaveDeck = () => {
    if (currentDeck) {
      setDecks([...decks, currentDeck])
      setCurrentView("dashboard")
    }
  }

  const handleStartStudy = (deck: Deck) => {
    setCurrentDeck(deck)
    // Generate sample cards for existing decks
    const cards: Flashcard[] = Array.from({ length: deck.dueCount || 5 }, (_, i) => ({
      id: `card-${i}`,
      question: `Question ${i + 1} from ${deck.name}`,
      answer: `Answer ${i + 1}: Detailed explanation about ${deck.name} that helps reinforce your learning.`,
    }))
    setCurrentCards(cards)
    setStudyStats({ hard: 0, good: 0, easy: 0 })
    setCurrentView("study")
  }

  const handleCompleteStudy = (stats: { hard: number; good: number; easy: number }) => {
    setStudyStats(stats)
    setCurrentView("complete")
  }

  const handleDeleteDeck = (id: string) => {
    setDecks(decks.filter((d) => d.id !== id))
  }

  const handleRenameDeck = (id: string, newName: string) => {
    setDecks(decks.map((d) => (d.id === id ? { ...d, name: newName } : d)))
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
        />
      )}
      {currentView === "create" && (
        <CreateDeckView onBack={() => setCurrentView("dashboard")} onGenerate={handleCreateDeck} />
      )}
      {currentView === "generating" && <GeneratingView topic={generatingTopic} cardCount={currentCards.length || 20} />}
      {currentView === "preview" && (
        <CardPreviewView
          deck={currentDeck}
          cards={currentCards}
          onSave={handleSaveDeck}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onRegenerate={() => setCurrentView("create")}
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
      {currentView === "complete" && (
        <SessionCompleteView
          deck={currentDeck}
          stats={studyStats}
          totalCards={currentCards.length}
          onBackToDashboard={() => setCurrentView("dashboard")}
          onStudyAgain={() => handleStartStudy(currentDeck!)}
        />
      )}
    </main>
  )
}
