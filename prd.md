# **Wikipedia Flashcard App - Final Requirements Document**

## **1. Project Overview**

**Name:** WikiFlash

**Type:** Web application (Next.js)

**Purpose:** Convert Wikipedia articles into flashcards for spaced repetition learning

**Target Users:** Self-learners, students, anyone wanting to memorize information from Wikipedia

**Development:** Solo "for fun" project

---

## **2. Functional Requirements**

### **2.1 Content Input**

- [ ]  User can enter a topic name in a text input field
- [ ]  User can paste a Wikipedia URL in the same input field
- [ ]  App detects whether input is a URL or topic name
- [ ]  App fetches Wikipedia article based on topic name or URL
- [ ]  App handles invalid/non-existent topics gracefully with error messages
- [ ]  App shows loading state while fetching content

### **2.2 Flashcard Generation**

- [ ]  **User defines how many flashcards to generate** (input field or slider: 5-50 cards)
- [ ]  App uses **Groq API** with Llama model (free tier) to generate flashcards
- [ ]  Extracts **all types of information**: definitions, examples, historical facts, key concepts, dates, relationships, causes/effects
- [ ]  **Loading animation**: Two hands shuffling cards while generating
- [ ]  Flashcards have clear question/answer format
- [ ]  User can preview generated flashcards before saving
- [ ]  User can manually edit generated flashcards (edit question/answer)
- [ ]  User can delete unwanted flashcards before saving deck
- [ ]  App handles API errors gracefully (rate limits, timeouts)

### **2.3 Flashcard Organization**

- [ ]  Each Wikipedia article becomes a "deck" of flashcards
- [ ]  Decks are named after the Wikipedia article title
- [ ]  User can view all their saved decks (grid or list view)
- [ ]  User can delete entire decks
- [ ]  User can rename decks
- [ ]  Decks show: card count, cards due today, last studied date

### **2.4 Spaced Repetition System (SM-2 Algorithm)**

- [ ]  Implements SM-2 spaced repetition algorithm
- [ ]  Each flashcard tracks:
    - Ease factor (starting at 2.5)
    - Interval (days until next review)
    - Repetition count
    - Next review date
    - Last reviewed date
- [ ]  **3-button rating system**: Hard / Good / Easy
    - **Hard**: Resets interval, card shows again soon
    - **Good**: Normal interval progression
    - **Easy**: Larger interval jump
- [ ]  App schedules cards based on user performance
- [ ]  Cards due for review are prioritized in study sessions
- [ ]  New cards (never studied) appear in study sessions

### **2.5 Study Session**

- [ ]  User can start a study session for a specific deck
- [ ]  App shows cards in order: due cards first, then new cards
- [ ]  Study interface shows question side first
- [ ]  User clicks to reveal answer (smooth card flip animation)
- [ ]  User rates their performance: **Hard / Good / Easy** (3 buttons)
- [ ]  App updates card scheduling based on rating
- [ ]  App shows progress during session (X/Y cards completed)
- [ ]  Session ends when no cards are due
- [ ]  User can end session early (with confirmation)
- [ ]  Session summary shown at end (cards reviewed, accuracy)

### **2.6 Progress Tracking**

- [ ]  Dashboard shows overall statistics:
    - Total decks
    - Total cards
    - Cards due today (across all decks)
    - Cards studied today
- [ ]  Per-deck statistics:
    - Total cards in deck
    - New cards (never studied)
    - Learning cards (interval < 7 days)
    - Mature cards (interval ≥ 7 days)
    - Cards due today
    - Next review date
- [ ]  Visual progress indicators per deck (progress bar or chart)
- [ ]  Study streak tracking (days in a row)

### **2.7 Data Persistence**

- [ ]  All decks and progress saved using **Supabase**
- [ ]  Anonymous user sessions (localStorage key linked to Supabase)
- [ ]  Data persists across browser sessions
- [ ]  No login required for MVP
- [ ]  Auto-save all changes (deck edits, study progress)

---

## **3. Non-Functional Requirements**

### **3.1 User Experience**

- [ ]  Clean, modern, intuitive interface
- [ ]  Better UX than Anki (simpler, more visual, friendly)
- [ ]  **Single-page app (SPA) for MVP** (routing planned for future)
- [ ]  **Smooth card flip animation** during study (3D transform)
- [ ]  **Shuffling hands animation** during card generation
- [ ]  **Color scheme**: Based on provided palette
    - Light mode: E8EBE4, D2D5DD, B8BACF, 999AC6, 798071
- [ ]  **Dark mode support** (toggle in settings)
- [ ]  Responsive design (desktop-first, mobile-optimized)
- [ ]  Accessible (keyboard navigation, ARIA labels)

### **3.2 Performance**

- [ ]  Wikipedia fetch completes within 3-5 seconds
- [ ]  Groq API flashcard generation completes within 5-10 seconds
- [ ]  Loading states for all async operations
- [ ]  Study session is responsive with no lag
- [ ]  Optimistic UI updates where possible

### **3.3 Reliability**

- [ ]  Handles network errors gracefully
- [ ]  Retry logic for failed API calls
- [ ]  Prevents data loss (auto-save, transaction safety)
- [ ]  Validates all user inputs
- [ ]  Clear, helpful error messages
- [ ]  Fallback UI for missing data

---

## **4. Technical Requirements**

### **4.1 Technology Stack**

- [x]  **Frontend**: Next.js 14 (App Router)
- [x]  **UI Components**: shadcn/ui
- [x]  **Styling**: Tailwind CSS (with custom color palette)
- [x]  **Database**: Supabase (PostgreSQL)
- [x]  **AI/LLM**: Groq API (Llama 3 or Mixtral models)
- [ ]  **State Management**: React Context or Zustand (if needed)
- [ ]  **Animations**: Framer Motion or CSS animations

### **4.2 APIs & Integration**

**Wikipedia API:**

- [ ]  Use Wikipedia REST API: `https://en.wikipedia.org/api/rest_v1/`
- [ ]  Endpoints: search, page summary, page content
- [ ]  Handle disambiguation pages
- [ ]  Extract clean text (strip HTML/markup)

**Groq API:**

- [ ]  API endpoint: `https://api.groq.com/openai/v1/chat/completions`
- [ ]  Model: `llama-3.1-70b-versatile` or `mixtral-8x7b-32768`
- [ ]  Free tier: 14,400 requests/day (10 req/min)
- [ ]  Prompt engineering for flashcard generation:
    
    ```
    Given the following Wikipedia article about [TOPIC], generate [N] flashcards.Create diverse questions covering: definitions, examples, facts, dates, causes/effects.Format: JSON array with {question: string, answer: string}
    
    ```
    
- [ ]  Handle rate limits and errors
- [ ]  Show estimated generation time to user

### **4.3 Supabase Schema**

```sql
-- Users table (optional for now, use session_id)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  wikipedia_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_studied_at TIMESTAMP
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  ease_factor DECIMAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review DATE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Study sessions table (for analytics)
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id),
  cards_reviewed INTEGER,
  session_date TIMESTAMP DEFAULT NOW()
);

```

### **4.4 SM-2 Algorithm Implementation**

```jsx
// SM-2 Algorithm pseudocode
function updateCard(card, quality) {
  // quality: 0 = Hard, 1 = Good, 2 = Easy

  if (quality === 0) { // Hard
    card.repetitions = 0;
    card.interval = 1;
  } else {
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.ease_factor);
    }

    card.repetitions += 1;

    // Update ease factor
    let qualityScore = quality === 1 ? 3 : 5; // Good = 3, Easy = 5
    card.ease_factor = card.ease_factor + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));

    if (card.ease_factor < 1.3) {
      card.ease_factor = 1.3;
    }
  }

  card.next_review = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);
  card.last_reviewed_at = new Date();

  return card;
}

```

---

## **5. Design Specifications**

### **5.1 Color Palette**

**Light Mode:**

- Background: `#E8EBE4`
- Surface/Cards: `#D2D5DD`
- Primary: `#B8BACF`
- Secondary: `#999AC6`
- Accent: `#798071`
- Text: `#2C2C2C`

**Dark Mode:** (complementary)

- Background: `#1C1C1E`
- Surface/Cards: `#2C2C2E`
- Primary: `#999AC6`
- Secondary: `#B8BACF`
- Accent: `#9BA88D`
- Text: `#E8EBE4`

### **5.2 Typography**

- [ ]  Headings: Modern sans-serif (Inter, Poppins)
- [ ]  Body: Readable sans-serif (System UI, Inter)
- [ ]  Card text: Slightly larger, comfortable reading size

### **5.3 Key UI Components**

**Home/Dashboard:**

- Search input (topic or URL)
- Number of cards selector (5-50)
- "Generate Flashcards" button
- Deck grid/list
- Stats overview

**Card Generation Loading:**

- Shuffling hands animation (center)
- Progress text: "Generating X flashcards..."
- Cancel button

**Card Preview:**

- Grid of generated cards
- Edit/delete buttons per card
- "Save Deck" button
- "Regenerate" option

**Study Session:**

- Card display (centered, large)
- Question → Flip → Answer
- 3 rating buttons: Hard / Good / Easy
- Progress bar at top
- Exit button

**Deck Management:**

- Deck cards with stats
- Study button
- Edit/delete options
- Last studied date

### **5.4 Animations**

- [ ]  Card flip: 3D transform (rotateY)
- [ ]  Shuffling hands: Lottie animation or CSS keyframes
- [ ]  Page transitions: Smooth fade/slide
- [ ]  Button feedback: Scale on press
- [ ]  Loading states: Skeleton loaders

---

## **6. Out of Scope (Post-MVP)**

- Multiple pages/routes (using SPA for MVP)
- User authentication/login
- Cloud sync across devices
- Sharing decks publicly
- Community decks
- Images/media in flashcards
- Audio pronunciation
- Multiple study modes (matching, multiple choice)
- Gamification (points, badges, leaderboards)
- Mobile app (PWA)
- Export/import decks
- Deck tags/categories
- Advanced statistics & analytics

---

## **7. MVP Development Roadmap**

### **Phase 1: Project Setup (Day 1)**

- [ ]  Initialize Next.js project with TypeScript
- [ ]  Install shadcn/ui components
- [ ]  Configure Tailwind with custom color palette
- [ ]  Set up Supabase project and connection
- [ ]  Create database schema
- [ ]  Set up environment variables
- [ ]  Implement dark mode toggle

### **Phase 2: Wikipedia Integration (Days 2-3)**

- [ ]  Build input component (topic or URL)
- [ ]  Integrate Wikipedia API
- [ ]  Implement topic search
- [ ]  Extract and parse article content
- [ ]  Handle errors (invalid topics, network issues)
- [ ]  Add loading states

### **Phase 3: AI Flashcard Generation (Days 4-6)**

- [ ]  Set up Groq API integration
- [ ]  Design flashcard generation prompt
- [ ]  Implement card count selector (5-50)
- [ ]  Build shuffling hands animation
- [ ]  Generate flashcards from Wikipedia content
- [ ]  Parse and validate AI responses
- [ ]  Handle API rate limits and errors
- [ ]  Build card preview UI
- [ ]  Implement edit/delete cards functionality
- [ ]  Save deck to Supabase

### **Phase 4: Spaced Repetition System (Days 7-9)**

- [ ]  Implement SM-2 algorithm
- [ ]  Build study session UI
- [ ]  Implement card flip animation
- [ ]  Add Hard/Good/Easy rating buttons
- [ ]  Update card scheduling on rating
- [ ]  Show progress during session
- [ ]  Display session summary
- [ ]  Save study progress to Supabase

### **Phase 5: Deck Management (Days 10-11)**

- [ ]  Build dashboard with deck grid
- [ ]  Show deck statistics (cards due, total cards)
- [ ]  Implement deck deletion
- [ ]  Implement deck renaming
- [ ]  Add "Study Now" button per deck
- [ ]  Filter decks by cards due

### **Phase 6: Progress Tracking (Day 12)**

- [ ]  Display overall stats on dashboard
- [ ]  Show per-deck statistics
- [ ]  Implement study streak tracking
- [ ]  Add visual progress indicators
- [ ]  Create simple charts/graphs

### **Phase 7: Polish & Testing (Days 13-14)**

- [ ]  Responsive design testing
- [ ]  Dark mode refinement
- [ ]  Animation polish
- [ ]  Error handling review
- [ ]  Performance optimization
- [ ]  User testing with friends
- [ ]  Bug fixes

---

## **8. Success Criteria**

The MVP is successful if:

- [ ]  User can generate flashcards from any Wikipedia topic in under 15 seconds
- [ ]  Flashcard quality is good (relevant questions, accurate answers)
- [ ]  User can complete a study session without confusion
- [ ]  Spaced repetition works correctly (cards reappear at appropriate intervals)
- [ ]  All data persists across sessions
- [ ]  The interface feels modern and better than Anki
- [ ]  Dark mode works seamlessly
- [ ]  No critical bugs

---

## **9. Risk Mitigation**

**Risk 1: Groq API rate limits**

- Solution: Implement rate limit handling, show clear messaging to users, cache generated cards

**Risk 2: Poor flashcard quality from AI**

- Solution: Refine prompts, add examples, implement user editing, potentially add regeneration option

**Risk 3: Wikipedia content too large**

- Solution: Limit content extraction to first N paragraphs, use summaries for very long articles

**Risk 4: Complex SM-2 implementation**

- Solution: Use existing libraries or well-tested implementations, start with simplified version