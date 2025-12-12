# **WikiFlash - Detailed Task Breakdown**

---

## **PHASE 1: Project Setup & Foundation**
**Goal:** Set up development environment and core infrastructure  
**Estimated Time:** 1 day

### **1.1 Initialize Next.js Project**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** None
- **Tasks:**
  - [ ] Create Next.js 14 project with TypeScript and App Router
  - [ ] Configure project structure (app, components, lib, types folders)
  - [ ] Set up `.env.local` for environment variables
  - [ ] Initialize git repository
  - [ ] Create `.gitignore` (exclude `.env.local`, `node_modules`)

### **1.2 Install and Configure UI Dependencies**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 1.1
- **Tasks:**
  - [ ] Install shadcn/ui CLI
  - [ ] Initialize shadcn/ui configuration
  - [ ] Install Tailwind CSS (comes with shadcn)
  - [ ] Configure Tailwind config with custom color palette:
    ```js
    colors: {
      background: '#E8EBE4',
      surface: '#D2D5DD',
      primary: '#B8BACF',
      secondary: '#999AC6',
      accent: '#798071',
      // Dark mode variants
    }
    ```
  - [ ] Install needed shadcn components: button, card, input, dialog, toast

### **1.3 Set Up Supabase**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 1.1
- **Tasks:**
  - [ ] Create Supabase project at supabase.com
  - [ ] Install Supabase client: `npm install @supabase/supabase-js`
  - [ ] Create `lib/supabase.ts` with Supabase client initialization
  - [ ] Add Supabase URL and anon key to `.env.local`
  - [ ] Test connection to Supabase

### **1.4 Create Database Schema**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 1.3
- **Tasks:**
  - [ ] In Supabase SQL editor, create `sessions` table
  - [ ] Create `decks` table with foreign key to sessions
  - [ ] Create `cards` table with foreign key to decks
  - [ ] Create `study_sessions` table (optional for analytics)
  - [ ] Set up Row Level Security (RLS) policies (allow all for MVP)
  - [ ] Test tables with sample data

### **1.5 Implement Dark Mode**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 1.2
- **Tasks:**
  - [x] Install `next-themes`: `npm install next-themes`
  - [x] Create `ThemeProvider` component
  - [x] Wrap app in `ThemeProvider` in root layout
  - [x] Create dark mode color variants in Tailwind config
  - [x] Create theme toggle button component
  - [ ] Test theme switching

### **1.6 Session Management**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 1.3
- **Tasks:**
  - [x] Create `lib/session.ts` utility
  - [x] Generate UUID for anonymous user session on first visit
  - [x] Store session ID in localStorage
  - [x] Create or retrieve session in Supabase on app load
  - [x] Export `getSessionId()` function for use across app

---

## **PHASE 2: Wikipedia Integration**
**Goal:** Fetch and parse Wikipedia content  
**Estimated Time:** 2 days

### **2.1 Create Input Component**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 1.2
- **Tasks:**
  - [ ] Create `components/WikipediaInput.tsx`
  - [ ] Build input field with shadcn Input component
  - [ ] Add placeholder: "Enter topic or paste Wikipedia URL"
  - [ ] Add submit button
  - [ ] Style with custom colors
  - [ ] Handle form submission

### **2.2 Detect Input Type (Topic vs URL)**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 2.1
- **Tasks:**
  - [ ] Create `lib/wikipedia/detectInputType.ts`
  - [ ] Write regex to detect Wikipedia URLs
  - [ ] Return type: 'url' or 'topic'
  - [ ] Handle edge cases (mobile URLs, different language Wikipedias)
  - [ ] Write unit tests

### **2.3 Wikipedia API Integration**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 2.2
- **Tasks:**
  - [ ] Create `lib/wikipedia/api.ts`
  - [ ] Implement `searchWikipedia(topic)` function using Wikipedia API
  - [ ] Implement `getPageContent(title)` function
  - [ ] Handle URL parsing to extract page title
  - [ ] Handle disambiguation pages (return suggestions)
  - [ ] Add TypeScript types for API responses
  - [ ] Test with various topics

### **2.4 Content Extraction & Parsing**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 2.3
- **Tasks:**
  - [ ] Create `lib/wikipedia/parser.ts`
  - [ ] Extract plain text from Wikipedia HTML
  - [ ] Remove references, citations, navigation elements
  - [ ] Preserve paragraph structure
  - [ ] Limit content to first 5000 words (to avoid token limits)
  - [ ] Extract article title and summary
  - [ ] Handle special characters and formatting

### **2.5 Error Handling & Loading States**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 2.1, 2.3
- **Tasks:**
  - [ ] Add loading spinner to input component
  - [ ] Handle "page not found" errors
  - [ ] Handle network errors
  - [ ] Show error messages with shadcn Toast
  - [ ] Add retry button for failed requests
  - [ ] Disable submit button during loading

### **2.6 Card Count Selector**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 2.1
- **Tasks:**
  - [ ] Add number input or slider component
  - [ ] Set range: 5-50 cards
  - [ ] Default value: 20 cards
  - [ ] Style to match design
  - [ ] Pass value to flashcard generation function

---

## **PHASE 3: AI Flashcard Generation**
**Goal:** Generate flashcards using Groq API  
**Estimated Time:** 3 days

### **3.1 Groq API Setup**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** None
- **Tasks:**
  - [ ] Sign up for Groq API at console.groq.com
  - [ ] Get API key
  - [ ] Add `GROQ_API_KEY` to `.env.local`
  - [ ] Install Groq SDK or use fetch directly
  - [ ] Test basic API call

### **3.2 Prompt Engineering**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 3.1
- **Tasks:**
  - [ ] Create `lib/ai/prompts.ts`
  - [ ] Design system prompt for flashcard generation
  - [ ] Include instructions for: definitions, examples, facts, dates, causes/effects
  - [ ] Specify JSON output format: `{question: string, answer: string}[]`
  - [ ] Add examples of good flashcards
  - [ ] Test prompt with various topics
  - [ ] Iterate based on output quality

### **3.3 Flashcard Generation Function**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 3.1, 3.2, 2.4
- **Tasks:**
  - [ ] Create `lib/ai/generateFlashcards.ts`
  - [ ] Build function: `generateFlashcards(content, count, topic)`
  - [ ] Make API call to Groq with prompt
  - [ ] Use model: `llama-3.1-70b-versatile`
  - [ ] Parse JSON response
  - [ ] Validate flashcard format
  - [ ] Handle parsing errors
  - [ ] Return array of flashcards

### **3.4 Rate Limit & Error Handling**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 3.3
- **Tasks:**
  - [ ] Implement exponential backoff for retries
  - [ ] Handle rate limit errors (429 status)
  - [ ] Handle timeout errors
  - [ ] Handle invalid JSON responses
  - [ ] Show user-friendly error messages
  - [ ] Log errors for debugging

### **3.5 Shuffling Hands Animation**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** None
- **Tasks:**
  - [ ] Find or create shuffling hands animation (Lottie or CSS)
  - [ ] Option 1: Use Lottie animation from LottieFiles
  - [ ] Option 2: Create CSS keyframe animation
  - [ ] Create `components/ShufflingAnimation.tsx`
  - [ ] Add loading text: "Generating X flashcards..."
  - [ ] Add cancel button
  - [ ] Style to match design

### **3.6 Card Preview Component**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 3.3
- **Tasks:**
  - [ ] Create `components/CardPreview.tsx`
  - [ ] Display generated cards in grid layout
  - [ ] Show question and answer for each card
  - [ ] Add edit button per card (opens dialog)
  - [ ] Add delete button per card
  - [ ] Create edit dialog with form
  - [ ] Handle card updates in state
  - [ ] Add "Save Deck" button at bottom
  - [ ] Add "Regenerate" button option

### **3.7 Save Deck to Supabase**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 3.6, 1.4
- **Tasks:**
  - [ ] Create `lib/supabase/decks.ts`
  - [ ] Implement `createDeck(name, topic, url, sessionId)`
  - [ ] Implement `createCards(deckId, cards[])`
  - [ ] Use Supabase transactions for atomicity
  - [ ] Handle errors (show toast on failure)
  - [ ] Redirect to dashboard on success
  - [ ] Show success message

---

## **PHASE 4: Spaced Repetition System**
**Goal:** Implement SM-2 algorithm and study session  
**Estimated Time:** 3 days

### **4.1 SM-2 Algorithm Implementation**
- **Priority:** Must-have
- **Complexity:** Complex
- **Dependencies:** None
- **Tasks:**
  - [ ] Create `lib/spaced-repetition/sm2.ts`
  - [ ] Implement `updateCard(card, quality)` function
  - [ ] Quality mapping: Hard=0, Good=1, Easy=2
  - [ ] Calculate new ease factor
  - [ ] Calculate new interval
  - [ ] Calculate next review date
  - [ ] Ensure ease factor stays >= 1.3
  - [ ] Write unit tests for edge cases
  - [ ] Test with sample card progressions

### **4.2 Get Due Cards Function**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 1.4
- **Tasks:**
  - [ ] Create `lib/supabase/cards.ts`
  - [ ] Implement `getDueCards(deckId)` query
  - [ ] Filter cards where `next_review <= today`
  - [ ] Order by: due cards first, then new cards
  - [ ] Return cards with all SM-2 data
  - [ ] Handle empty results

### **4.3 Study Session Component**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 4.2
- **Tasks:**
  - [ ] Create `components/StudySession.tsx`
  - [ ] Fetch due cards on mount
  - [ ] Handle "no cards due" state
  - [ ] Initialize session state (current card index, cards reviewed)
  - [ ] Render current card
  - [ ] Handle session end (show summary)

### **4.4 Flashcard Display Component**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 4.3
- **Tasks:**
  - [ ] Create `components/Flashcard.tsx`
  - [ ] Show question side initially
  - [ ] Add "Show Answer" button
  - [ ] Implement card flip animation (CSS 3D transform)
  - [ ] Show answer side after flip
  - [ ] Style card with surface color
  - [ ] Make card large and centered
  - [ ] Ensure text is readable

### **4.5 Rating Buttons Component**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 4.4
- **Tasks:**
  - [ ] Create `components/RatingButtons.tsx`
  - [ ] Create 3 buttons: Hard, Good, Easy
  - [ ] Style with different colors (red, yellow, green variants)
  - [ ] Disable buttons until answer is revealed
  - [ ] Handle click events
  - [ ] Pass rating to parent component

### **4.6 Update Card on Rating**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 4.1, 4.5
- **Tasks:**
  - [ ] In StudySession, handle rating submission
  - [ ] Call SM-2 algorithm with current card and rating
  - [ ] Get updated card data
  - [ ] Save updated card to Supabase
  - [ ] Move to next card
  - [ ] Update session progress
  - [ ] Handle last card (end session)

### **4.7 Progress Bar Component**
- **Priority:** Should-have
- **Complexity:** Simple
- **Dependencies:** 4.3
- **Tasks:**
  - [ ] Create `components/ProgressBar.tsx`
  - [ ] Show cards completed / total cards
  - [ ] Display as bar at top of study session
  - [ ] Update in real-time as cards are reviewed
  - [ ] Style with primary color

### **4.8 Session Summary Component**
- **Priority:** Should-have
- **Complexity:** Simple
- **Dependencies:** 4.6
- **Tasks:**
  - [ ] Create `components/SessionSummary.tsx`
  - [ ] Show cards reviewed count
  - [ ] Show breakdown: Hard/Good/Easy ratings
  - [ ] Calculate and show accuracy or success rate
  - [ ] Add "Back to Dashboard" button
  - [ ] Add "Study Again" button (if more cards available)
  - [ ] Style as a card modal

### **4.9 Save Study Session to Database**
- **Priority:** Nice-to-have
- **Complexity:** Simple
- **Dependencies:** 4.6
- **Tasks:**
  - [ ] Implement `createStudySession(deckId, cardsReviewed)` in Supabase
  - [ ] Save session data on completion
  - [ ] Update deck's `last_studied_at` timestamp
  - [ ] Handle errors silently (don't block user)

---

## **PHASE 5: Deck Management & Dashboard**
**Goal:** Display and manage decks  
**Estimated Time:** 2 days

### **5.1 Dashboard Layout**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 1.2
- **Tasks:**
  - [ ] Create `app/page.tsx` (home/dashboard)
  - [ ] Add page header with app name
  - [ ] Add theme toggle button in header
  - [ ] Create grid/list layout for decks
  - [ ] Add "Create Deck" button (opens Wikipedia input)
  - [ ] Make responsive (stack on mobile)

### **5.2 Fetch User Decks**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 1.4, 1.6
- **Tasks:**
  - [ ] Create `lib/supabase/decks.ts` (if not exists)
  - [ ] Implement `getDecks(sessionId)` function
  - [ ] Join with cards table to get card counts
  - [ ] Calculate cards due today per deck
  - [ ] Order by last_studied_at (most recent first)
  - [ ] Return deck data with stats

### **5.3 Deck Card Component**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** 5.2
- **Tasks:**
  - [ ] Create `components/DeckCard.tsx`
  - [ ] Display deck name
  - [ ] Show stats: total cards, cards due today
  - [ ] Show last studied date
  - [ ] Add "Study Now" button (prominent)
  - [ ] Add menu button (three dots) for more options
  - [ ] Style with surface color
  - [ ] Add hover effects

### **5.4 Deck Options Menu**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 5.3
- **Tasks:**
  - [ ] Create dropdown menu (use shadcn DropdownMenu)
  - [ ] Add "Rename" option
  - [ ] Add "Delete" option
  - [ ] Add "View Cards" option (nice-to-have)
  - [ ] Handle menu item clicks

### **5.5 Rename Deck Dialog**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 5.4
- **Tasks:**
  - [ ] Create `components/RenameDeckDialog.tsx`
  - [ ] Use shadcn Dialog component
  - [ ] Add text input with current name
  - [ ] Add "Save" and "Cancel" buttons
  - [ ] Implement `updateDeck(deckId, newName)` in Supabase
  - [ ] Update deck name on save
  - [ ] Show toast on success/error
  - [ ] Close dialog on save

### **5.6 Delete Deck Confirmation**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 5.4
- **Tasks:**
  - [ ] Create `components/DeleteDeckDialog.tsx`
  - [ ] Use shadcn AlertDialog component
  - [ ] Show warning message: "This will delete all cards"
  - [ ] Add "Delete" and "Cancel" buttons
  - [ ] Implement `deleteDeck(deckId)` in Supabase
  - [ ] Delete deck on confirmation (CASCADE deletes cards)
  - [ ] Refresh deck list
  - [ ] Show toast on success

### **5.7 Overall Statistics Component**
- **Priority:** Should-have
- **Complexity:** Simple
- **Dependencies:** 5.2
- **Tasks:**
  - [ ] Create `components/OverallStats.tsx`
  - [ ] Calculate and show: total decks, total cards, cards due today
  - [ ] Show study streak (if implemented)
  - [ ] Style as cards in grid
  - [ ] Use accent color for highlights
  - [ ] Place above deck list

### **5.8 Empty State Component**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 5.1
- **Tasks:**
  - [ ] Create `components/EmptyState.tsx`
  - [ ] Show when no decks exist
  - [ ] Display friendly message: "Create your first deck!"
  - [ ] Add large "Get Started" button
  - [ ] Add illustration or icon
  - [ ] Style with primary colors

---

## **PHASE 6: Progress Tracking**
**Goal:** Show detailed progress and statistics  
**Estimated Time:** 1 day

### **6.1 Per-Deck Statistics**
- **Priority:** Should-have
- **Complexity:** Medium
- **Dependencies:** 5.2
- **Tasks:**
  - [ ] Modify `getDecks()` to include detailed stats
  - [ ] Calculate: new cards, learning cards, mature cards
  - [ ] Learning cards: interval < 7 days
  - [ ] Mature cards: interval >= 7 days
  - [ ] Add to DeckCard component display

### **6.2 Study Streak Tracking**
- **Priority:** Nice-to-have
- **Complexity:** Medium
- **Dependencies:** 4.9
- **Tasks:**
  - [ ] Create `lib/streak.ts`
  - [ ] Implement `calculateStreak(sessionId)` function
  - [ ] Query study_sessions table for consecutive days
  - [ ] Return current streak count
  - [ ] Display in OverallStats component
  - [ ] Add flame icon for motivation

### **6.3 Progress Visualization**
- **Priority:** Nice-to-have
- **Complexity:** Medium
- **Dependencies:** 6.1
- **Tasks:**
  - [ ] Choose visualization approach (progress bars or simple indicators)
  - [ ] Show mastery progress per deck
  - [ ] Use color coding: new (gray), learning (yellow), mature (green)
  - [ ] Add tooltip with exact numbers
  - [ ] Keep it simple and clean

### **6.4 Cards Due Today Filter**
- **Priority:** Nice-to-have
- **Complexity:** Simple
- **Dependencies:** 5.2
- **Tasks:**
  - [ ] Add filter toggle: "Show all" vs "Due today"
  - [ ] Filter deck list based on cards due
  - [ ] Highlight decks with due cards
  - [ ] Show count of decks with due cards

---

## **PHASE 7: Polish & User Experience**
**Goal:** Refine UI, animations, and overall experience  
**Estimated Time:** 2 days

### **7.1 Animation Refinement**
- **Priority:** Should-have
- **Complexity:** Medium
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Smooth card flip animation (tune timing, easing)
  - [ ] Add page transition animations
  - [ ] Button hover/press animations
  - [ ] Loading skeleton animations
  - [ ] Ensure animations are performant (60fps)
  - [ ] Test on slower devices

### **7.2 Responsive Design**
- **Priority:** Must-have
- **Complexity:** Medium
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Test all pages on mobile (375px width)
  - [ ] Test on tablet (768px width)
  - [ ] Adjust grid layouts for mobile
  - [ ] Ensure touch targets are large enough (44px min)
  - [ ] Test card flip on touch devices
  - [ ] Adjust font sizes for readability
  - [ ] Fix any overflow issues

### **7.3 Accessibility**
- **Priority:** Should-have
- **Complexity:** Medium
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Add ARIA labels to interactive elements
  - [ ] Ensure keyboard navigation works (Tab, Enter, Escape)
  - [ ] Test with screen reader
  - [ ] Ensure color contrast meets WCAG AA standards
  - [ ] Add focus indicators
  - [ ] Add skip links if needed

### **7.4 Error Handling Review**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Review all error states
  - [ ] Ensure all errors show user-friendly messages
  - [ ] Add error boundaries for React errors
  - [ ] Test network failure scenarios
  - [ ] Test API failure scenarios
  - [ ] Ensure no silent failures

### **7.5 Loading States**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Add skeleton loaders for deck list
  - [ ] Add loading spinner for API calls
  - [ ] Show progress during flashcard generation
  - [ ] Disable buttons during async operations
  - [ ] Ensure no layout shift when loading completes

### **7.6 Performance Optimization**
- **Priority:** Should-have
- **Complexity:** Medium
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Implement code splitting for routes
  - [ ] Lazy load heavy components
  - [ ] Optimize images (if any)
  - [ ] Minimize bundle size
  - [ ] Test page load performance (Lighthouse)
  - [ ] Optimize Supabase queries (add indexes if needed)

### **7.7 User Onboarding**
- **Priority:** Nice-to-have
- **Complexity:** Simple
- **Dependencies:** 5.8
- **Tasks:**
  - [ ] Create welcome message for first-time users
  - [ ] Add tooltips or hints for key features
  - [ ] Create sample deck for demonstration
  - [ ] Add help/info icons where needed
  - [ ] Create FAQ or help section (optional)

---

## **PHASE 8: Testing & Bug Fixes**
**Goal:** Ensure app works reliably  
**Estimated Time:** 1 day

### **8.1 Manual Testing**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Test complete user flow: input → generate → study
  - [ ] Test with various Wikipedia topics (simple, complex, long)
  - [ ] Test with invalid inputs
  - [ ] Test deck management (rename, delete)
  - [ ] Test spaced repetition (cards show up at right times)
  - [ ] Test on multiple browsers (Chrome, Firefox, Safari)
  - [ ] Test dark mode thoroughly

### **8.2 Edge Case Testing**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Test with very short Wikipedia articles
  - [ ] Test with very long Wikipedia articles
  - [ ] Test with non-English Wikipedia (if supported)
  - [ ] Test with 5 cards (minimum)
  - [ ] Test with 50 cards (maximum)
  - [ ] Test offline behavior
  - [ ] Test with slow network

### **8.3 Data Persistence Testing**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Test that decks persist after browser close
  - [ ] Test that study progress persists
  - [ ] Test session management across refreshes
  - [ ] Test localStorage/Supabase sync
  - [ ] Test data integrity after errors

### **8.4 Bug Fixing**
- **Priority:** Must-have
- **Complexity:** Variable
- **Dependencies:** 8.1, 8.2, 8.3
- **Tasks:**
  - [ ] Document all bugs found
  - [ ] Prioritize bugs (critical, major, minor)
  - [ ] Fix critical bugs (app-breaking issues)
  - [ ] Fix major bugs (feature-breaking issues)
  - [ ] Address minor bugs if time permits
  - [ ] Retest after fixes

### **8.5 User Testing**
- **Priority:** Should-have
- **Complexity:** Simple
- **Dependencies:** 8.4
- **Tasks:**
  - [ ] Ask 2-3 friends to test the app
  - [ ] Observe them using it (don't guide them)
  - [ ] Collect feedback on UX
  - [ ] Note any confusion points
  - [ ] Identify missing features or pain points
  - [ ] Implement quick wins from feedback

---

## **PHASE 9: Deployment**
**Goal:** Deploy app to production  
**Estimated Time:** 0.5 day

### **9.1 Prepare for Deployment**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** All previous phases
- **Tasks:**
  - [ ] Review and clean up code
  - [ ] Remove console.logs and debug code
  - [ ] Update environment variables for production
  - [ ] Test build locally: `npm run build`
  - [ ] Fix any build errors or warnings

### **9.2 Deploy to Vercel**
- **Priority:** Must-have
- **Complexity:** Simple
- **Dependencies:** 9.1
- **Tasks:**
  - [ ] Create Vercel account (if needed)
  - [ ] Connect GitHub repository to Vercel
  - [ ] Configure environment variables in Vercel
  - [ ] Deploy to production
  - [ ] Test deployed app thoroughly
  - [ ] Set up custom domain (optional)

### **9.3 Monitor & Iterate**
- **Priority:** Should-have
- **Complexity:** Simple
- **Dependencies:** 9.2
- **Tasks:**
  - [ ] Set up error tracking (Sentry or similar)
  - [ ] Monitor Supabase usage
  - [ ] Monitor Groq API usage
  - [ ] Collect user feedback
  - [ ] Plan next iteration features

---

## **Summary by Priority**

### **Must-Have Tasks (Critical for MVP):** 52 tasks
- All of Phase 1 (Foundation)
- All of Phase 2 (Wikipedia)
- Most of Phase 3 (AI generation)
- Most of Phase 4 (Study system)
- Most of Phase 5 (Deck management)
- Core Phase 7 (Responsive, errors, loading)
- All of Phase 8 (Testing)
- All of Phase 9 (Deployment)

### **Should-Have Tasks (Important but can simplify):** 12 tasks
- Progress bar in study session
- Session summary
- Overall statistics
- Per-deck statistics
- Some polish items
- Accessibility
- User testing

### **Nice-to-Have Tasks (Post-MVP):** 8 tasks
- Study session tracking to database
- Study streak
- Progress visualization
- Cards due filter
- User onboarding

---

## **Estimated Timeline**

**Total MVP Time: ~14 days of focused work**

- Phase 1: 1 day
- Phase 2: 2 days
- Phase 3: 3 days
- Phase 4: 3 days
- Phase 5: 2 days
- Phase 6: 1 day (mostly nice-to-haves)
- Phase 7: 2 days
- Phase 8: 1 day
- Phase 9: 0.5 day

**If working part-time (evenings/weekends): 3-4 weeks**

---

## **Development Tips**

1. **Work in order**: Follow phases sequentially for logical progression
2. **Test as you go**: Don't wait until Phase 8 to test
3. **Commit often**: Commit after completing each task
4. **Use feature branches**: Create branches for major features
5. **Start simple**: Get basic version working before adding polish
6. **Ask for help**: Use AI assistants, docs, and communities when stuck

---