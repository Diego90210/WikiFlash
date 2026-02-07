"use client"

import { BookOpen, Plus, MoreVertical, Edit2, Trash2, Clock, Sparkles, Brain, Loader2 } from "lucide-react"
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
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language/context"
import { useTranslations } from "@/lib/language/use-translations"
import { extractLanguageFromUrl } from "@/lib/language/types"
import type { Deck } from "@/app/page"
import { useState, useEffect, useRef } from "react"
import { detectInputType, extractPageTitleFromUrl, extractLanguageAndTitleFromUrl } from "@/lib/wikipedia/detectInputType"
import { searchWikipedia, getPageHtml, type WikipediaSearchResult } from "@/lib/wikipedia/api"
import { parseWikipediaContent } from "@/lib/wikipedia/parser"

type DashboardViewProps = {
  decks: Deck[]
  onCreateDeck: (topic: string, cardCount: number, content?: string, deckLanguage?: 'en' | 'es') => void
  onStudyDeck: (deck: Deck) => void
  onDeleteDeck: (id: string) => void
  onRenameDeck: (id: string, newName: string) => void
  isLoadingDecks?: boolean
}

export function DashboardView({ decks, onCreateDeck, onStudyDeck, onDeleteDeck, onRenameDeck, isLoadingDecks = false }: DashboardViewProps) {
  const { language } = useLanguage()
  const t = useTranslations()
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
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<string>("")
  const [foundArticle, setFoundArticle] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<WikipediaSearchResult[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const justSelectedRef = useRef(false)

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

  // Debounced search for Wikipedia suggestions
  useEffect(() => {
    const query = wikipediaTopic.trim()

    // Don't search if it's a URL or empty
    if (!query || detectInputType(query) === 'url') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Don't search for very short queries
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      // Don't show suggestions if we just selected one
      if (justSelectedRef.current) {
        justSelectedRef.current = false
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoadingSuggestions(true)
      try {
        const results = await searchWikipedia(query, language)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
        setSelectedSuggestionIndex(-1)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [wikipediaTopic, language])

  const handleSuggestionSelect = (suggestion: WikipediaSearchResult) => {
    justSelectedRef.current = true
    setWikipediaTopic(suggestion.title)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    inputRef.current?.focus()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && !isLoading) {
        handleCreateDeck()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex])
        } else if (!isLoading) {
          handleCreateDeck()
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCreateDeck = async () => {
    if (!wikipediaTopic.trim()) {
      return
    }

    setIsLoading(true)
    setLoadingStatus("")
    setFoundArticle(null)
    let content: string | undefined
    let finalTopic = wikipediaTopic.trim()

    try {
      const inputType = detectInputType(finalTopic)
      let articleLanguage = language // Default to selected language

      if (inputType === 'url') {
        // Extract language and title from URL
        setLoadingStatus(t.extractingPageTitle)
        const { language: urlLanguage, title: pageTitle } = extractLanguageAndTitleFromUrl(finalTopic)

        if (!pageTitle) {
          throw new Error("Invalid Wikipedia URL. Please check the URL and try again.")
        }

        // Use language from URL if detected, otherwise use selected language
        if (urlLanguage && (urlLanguage === 'en' || urlLanguage === 'es')) {
          articleLanguage = urlLanguage
        }

        finalTopic = pageTitle
        setFoundArticle(pageTitle)

        // Fetch page HTML
        setLoadingStatus(t.fetchingWikipediaPage)
        const html = await getPageHtml(pageTitle, articleLanguage)

        // Parse content
        setLoadingStatus(t.parsingArticleContent)
        const parsed = parseWikipediaContent(html, pageTitle)
        content = parsed.text

        setLoadingStatus(t.articleLoadedSuccessfully)

        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        // Search for topic
        setLoadingStatus(`${t.searchingWikipedia} "${finalTopic}"...`)
        const searchResults = await searchWikipedia(finalTopic, articleLanguage)

        if (searchResults.length === 0) {
          throw new Error(`No Wikipedia articles found for "${finalTopic}". Please try a different topic.`)
        }

        // Use the first search result
        const firstResult = searchResults[0]
        finalTopic = firstResult.title
        setFoundArticle(firstResult.title)

        // Fetch page HTML
        setLoadingStatus(`${t.loadingArticle} ${firstResult.title}...`)
        const html = await getPageHtml(firstResult.title, articleLanguage)

        // Parse content
        setLoadingStatus(t.parsingArticleContent)
        const parsed = parseWikipediaContent(html, firstResult.title)
        content = parsed.text

        setLoadingStatus(t.articleLoadedSuccessfully)

        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Call onGenerate with the content
      // Use custom count only if it's a valid non-empty number, otherwise use selected count
      const count = customCardCount && customCardCount.trim() && !isNaN(Number.parseInt(customCardCount))
        ? Number.parseInt(customCardCount)
        : selectedCardCount
      onCreateDeck(finalTopic, count, content, articleLanguage)
      setCreateDialog(false)
      setWikipediaTopic("")
      setCustomCardCount("")
      setSelectedCardCount(20)
      setIsLoading(false)
      setLoadingStatus("")
      setFoundArticle(null)
    } catch (error) {
      console.error("Error fetching Wikipedia content:", error)
      let errorMessage = error instanceof Error ? error.message : "Failed to fetch Wikipedia content. Please try again."

      // Make error messages more user-friendly
      if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Network error: Unable to connect to Wikipedia. Please check your internet connection and try again."
      } else if (errorMessage.includes("not found")) {
        errorMessage = "Article not found. Please check the topic or URL and try again."
      } else if (errorMessage.includes("Invalid")) {
        errorMessage = "Invalid input. Please enter a valid Wikipedia topic or URL."
      } else if (errorMessage.includes("No Wikipedia articles")) {
        // Keep this message as is - it's already user-friendly
      } else {
        errorMessage = `Unable to fetch content: ${errorMessage}`
      }

      setLoadingStatus(`${t.error} ${errorMessage}`)
      setIsLoading(false)
      // Don't close dialog on error, let user retry
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
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {isLoadingDecks ? (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">{t.loadingYourDecks}</p>
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            {/* Hero Text */}
            <div className="text-center max-w-2xl mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-tight">
                {t.heroHeading}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground/70 leading-relaxed">
                {t.heroSubheading}
              </p>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={() => setCreateDialog(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              aria-label="Create your first flashcard deck"
            >
              {t.createYourFirstDeck}
            </Button>

            {/* How It Works Section */}
            <div className="w-full max-w-5xl mt-20">
              <h3 className="text-2xl md:text-3xl font-semibold text-center mb-12 text-foreground">{t.howItWorks}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-foreground">{t.enterTopic}</h4>
                  <p className="text-sm text-muted-foreground/70">{t.enterTopicDescription}</p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-secondary" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-foreground">{t.aiGenerates}</h4>
                  <p className="text-sm text-muted-foreground/70">{t.aiGeneratesDescription}</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-accent" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-foreground">{t.studyMaster}</h4>
                  <p className="text-sm text-muted-foreground/70">{t.studyMasterDescription}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t.yourDecks}</h2>
              <Button
                onClick={() => setCreateDialog(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                aria-label={t.createNewDeck}
              >
                <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                {t.createNewDeck}
              </Button>
            </div>

            {/* Decks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {decks.map((deck) => (
                <Card
                  key={deck.id}
                  className={`bg-card border-2 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${deck.dueCount > 0 ? "border-accent/50" : "border-border"
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
                            aria-label={`Open menu for deck: ${deck.name}`}
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-lg shadow-lg">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameDialog({ open: true, deck })
                              setNewName(deck.name)
                            }}
                            aria-label={`Rename deck: ${deck.name}`}
                          >
                            <Edit2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t.renameDeck}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, deck })}
                            className="text-destructive focus:text-destructive"
                            aria-label={`Delete deck: ${deck.name}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t.deleteDeck}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-sm">{t.fromWikipedia}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {deck.cardCount} {t.cards}
                      </span>
                      {deck.dueCount > 0 && (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-accent/25 dark:bg-accent/15 text-accent dark:text-accent-foreground rounded-lg font-medium">
                          <Clock className="h-4 w-4" />
                          {deck.dueCount} {t.due}
                        </span>
                      )}
                    </div>

                    {/* Last Studied */}
                    {deck.lastStudied && (
                      <p className="text-xs text-muted-foreground/50 mb-4">
                        {t.lastStudied} {deck.lastStudied.toLocaleDateString()}
                      </p>
                    )}

                    {/* All Caught Up Message (Strict Spaced Repetition) */}
                    {deck.dueCount === 0 ? (
                      <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
                        <div className="text-2xl mb-2">🎉</div>
                        <h3 className="text-sm font-bold mb-1 text-foreground">{t.allCaughtUp}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {t.allCaughtUpDescription}
                        </p>
                        <Button
                          onClick={() => onStudyDeck(deck)}
                          disabled
                          className="w-full h-10 rounded-xl font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                          aria-label={`Study deck: ${deck.name}. All cards are up to date.`}
                        >
                          {t.studyNow}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => onStudyDeck(deck)}
                        className="w-full h-11 rounded-xl font-semibold transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                        aria-label={`Study deck: ${deck.name}. ${deck.dueCount} cards due for review.`}
                      >
                        {t.studyNow}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <Dialog
        open={createDialog}
        onOpenChange={(open) => {
          if (!isLoading) {
            setCreateDialog(open)
            if (!open) {
              // Reset state when dialog closes
              setWikipediaTopic("")
              setCustomCardCount("")
              setSelectedCardCount(20)
              setIsLoading(false)
              setLoadingStatus("")
              setFoundArticle(null)
              setSuggestions([])
              setShowSuggestions(false)
              setSelectedSuggestionIndex(-1)
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold">{t.createNewDeckTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Wikipedia Input */}
            <div className="space-y-2 relative">
              <Label htmlFor="topic" className="text-base font-medium">
                {t.whatDoYouWantToLearn}
              </Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="topic"
                  placeholder={t.enterTopicPlaceholder}
                  value={wikipediaTopic}
                  onChange={(e) => {
                    setWikipediaTopic(e.target.value)
                    // Show suggestions when user types (will be controlled by useEffect based on results)
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  className="h-13 text-base rounded-xl border-2 focus-visible:ring-primary"
                  onKeyDown={handleInputKeyDown}
                  disabled={isLoading}
                  aria-label={t.enterTopicPlaceholder}
                  aria-describedby="topic-description"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-controls="suggestions-list"
                />
                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                  <div
                    ref={suggestionsRef}
                    id="suggestions-list"
                    role="listbox"
                    aria-label={t.wikipediaArticleSuggestions}
                    className="absolute z-50 w-full mt-1 bg-card border-2 border-border rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  >
                    {isLoadingSuggestions ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.pageid}
                          type="button"
                          role="option"
                          aria-selected={index === selectedSuggestionIndex}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0 ${index === selectedSuggestionIndex ? "bg-accent/50" : ""
                            }`}
                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        >
                          <div className="font-medium text-foreground mb-1">{suggestion.title}</div>
                          {suggestion.snippet && (
                            <div
                              className="text-sm text-muted-foreground line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: suggestion.snippet }}
                            />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p id="topic-description" className="text-sm text-muted-foreground/50">{t.topicDescription}</p>

              {/* Loading Status */}
              {isLoading && loadingStatus && (
                <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm text-foreground font-medium">{loadingStatus}</p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {!isLoading && loadingStatus && loadingStatus.startsWith(t.error) && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">{loadingStatus}</p>
                </div>
              )}
            </div>

            {/* Card Count Selector */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t.numberOfFlashcards}</Label>
              <div className="flex flex-wrap items-center gap-3">
                {[10, 20, 30].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setSelectedCardCount(count)
                      setCustomCardCount("")
                    }}
                    className={`w-20 h-11 rounded-xl font-semibold text-base transition-all duration-200 border-2 ${selectedCardCount === count && !customCardCount
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-transparent border-muted text-foreground hover:border-primary/50 hover:scale-105"
                      }`}
                  >
                    {count}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom" className="text-sm font-medium text-muted-foreground">
                    {t.custom}
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
              disabled={!wikipediaTopic.trim() || isLoading}
              className="w-full h-13 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              aria-label={isLoading ? t.generatingFlashcards : t.generateFlashcards}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {loadingStatus || t.loading}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.generateFlashcards}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, deck: null })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t.renameDeckTitle}</DialogTitle>
            <DialogDescription>{t.renameDeckDescription}</DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.deckName}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, deck: null })} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button onClick={handleRename} className="rounded-xl">
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, deck: null })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t.deleteDeckTitle}</DialogTitle>
            <DialogDescription>
              {t.deleteDeckDescription.replace('{name}', deleteDialog.deck?.name || '').replace('{count}', String(deleteDialog.deck?.cardCount || 0))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, deck: null })} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
