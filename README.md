# WikiFlash

An intelligent flashcard learning application that generates study decks from Wikipedia content using AI, featuring spaced repetition algorithms for optimal learning retention.

## Features

- **AI-Powered Generation**: Automatically generates flashcards from Wikipedia articles using Groq AI
- **Spaced Repetition**: Implements SM-2 algorithm for optimal learning intervals
- **Multi-Language Support**: Available in English and Spanish
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI
- **Real-time Progress**: Track your learning progress with detailed statistics
- **Dark/Light Mode**: Toggle between themes for comfortable studying
- **Session Management**: Persistent study sessions with automatic progress saving

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for database)
- Groq API key (for AI generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Diego90210/WikiFlash.git
   cd WikiFlash
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
   
   # Groq API Key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Set up Supabase database**
   
   Run the SQL migration in your Supabase SQL editor:
   ```sql
   -- Create decks table
   CREATE TABLE decks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     topic TEXT NOT NULL,
     session_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_studied_at TIMESTAMP WITH TIME ZONE,
     language TEXT DEFAULT 'en'
   );
   
   -- Create cards table
   CREATE TABLE cards (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
     question TEXT NOT NULL,
     answer TEXT NOT NULL,
     ease_factor FLOAT DEFAULT 2.5,
     interval INTEGER DEFAULT 1,
     repetitions INTEGER DEFAULT 0,
     next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Create indexes for performance
   CREATE INDEX idx_cards_deck_id ON cards(deck_id);
   CREATE INDEX idx_cards_next_review ON cards(next_review);
   CREATE INDEX idx_decks_session_id ON decks(session_id);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

### 1. Create Flashcard Decks
- Enter a topic or Wikipedia URL
- Choose the number of cards to generate (1-50)
- Select language (English/Spanish)
- AI analyzes the content and generates relevant Q&A pairs

### 2. Study with Spaced Repetition
- Cards are scheduled based on SM-2 algorithm
- Rate difficulty: Very Hard, Hard, Good, Easy, Too Easy
- System adjusts intervals based on your performance
- Only due cards appear in study sessions

### 3. Track Progress
- View study statistics after each session
- Monitor due cards across all decks
- See next review dates for optimal timing

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### Backend & Database
- **Supabase** - PostgreSQL database and real-time API
- **Groq AI** - Fast LLM for flashcard generation

### Key Libraries
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date utilities
- **next-themes** - Theme management

## Project Structure

```
WikiFlash/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate-flashcards/
│   │   └── translate/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard-view.tsx
│   ├── study-session-view.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── ai/              # AI integration
│   ├── language/        # Internationalization
│   ├── spaced-repetition/ # SM-2 algorithm
│   ├── supabase/        # Database operations
│   └── wikipedia/        # Content fetching
└── public/              # Static assets
```

## Core Features Explained

### Spaced Repetition Algorithm
WikiFlash uses the SM-2 algorithm to optimize learning:
- **Ease Factor**: Card difficulty rating (1.3-2.5)
- **Interval**: Days between reviews
- **Repetitions**: Number of successful recalls
- **Next Review**: Calculated based on performance

### AI Flashcard Generation
- Fetches Wikipedia content via API
- Uses Groq LLM to extract key concepts
- Generates question-answer pairs
- Supports multiple languages

### Session Management
- Browser-based session identification
- Automatic progress saving
- Cross-device synchronization via Supabase

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
GROQ_API_KEY=your_groq_key

# Optional
VERCEL_ANALYTICS_ID=your_analytics_id
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Wikipedia** - For providing comprehensive educational content
- **Groq** - Fast AI inference for flashcard generation
- **Supabase** - Backend-as-a-service platform
- **SuperMemo** - Inspiration for the SM-2 spaced repetition algorithm

## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [documentation](https://github.com/Diego90210/WikiFlash/wiki)
- Join our community discussions

---

**Happy Learning!**
