"use client"

import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"

type GeneratingViewProps = {
  topic: string
  cardCount: number
  onCancel?: () => void
}

export function GeneratingView({ topic, cardCount, onCancel }: GeneratingViewProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {onCancel && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="absolute top-4 right-4 z-50"
          aria-label="Cancel generation"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <div className="text-center max-w-md">
        <div className="mb-10 relative">
          {/* Card Stack Container */}
          <div className="w-36 h-48 mx-auto relative perspective-1000">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 bg-gradient-to-br from-card to-card/80 border-2 border-primary/30 rounded-xl shadow-2xl backdrop-blur-sm"
                style={{
                  animation: `cardShuffle${i} 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                  animationDelay: `${i * 0.12}s`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Card Content */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
                {/* Card Shine Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 animate-shine" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Generating {cardCount} flashcards
          </h2>
          <p className="text-lg text-muted-foreground">
            about <span className="font-semibold text-primary">{topic}</span>
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes cardShuffle0 {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 5;
            opacity: 1;
          }
          20% { 
            transform: translateY(-25px) translateX(-35px) rotate(-18deg) scale(1.05);
            z-index: 10;
            opacity: 0.95;
          }
          40% { 
            transform: translateY(-50px) translateX(0) rotate(0deg) scale(1.1);
            z-index: 10;
            opacity: 0.9;
          }
          60% { 
            transform: translateY(-25px) translateX(35px) rotate(18deg) scale(1.05);
            z-index: 10;
            opacity: 0.95;
          }
          80% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 5;
            opacity: 1;
          }
        }
        
        @keyframes cardShuffle1 {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 4;
            opacity: 0.95;
          }
          20% { 
            transform: translateY(-20px) translateX(-28px) rotate(-14deg) scale(1.04);
            z-index: 9;
            opacity: 0.9;
          }
          40% { 
            transform: translateY(-45px) translateX(0) rotate(0deg) scale(1.08);
            z-index: 9;
            opacity: 0.85;
          }
          60% { 
            transform: translateY(-20px) translateX(28px) rotate(14deg) scale(1.04);
            z-index: 9;
            opacity: 0.9;
          }
          80% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 4;
            opacity: 0.95;
          }
        }
        
        @keyframes cardShuffle2 {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 3;
            opacity: 0.9;
          }
          20% { 
            transform: translateY(-15px) translateX(-22px) rotate(-10deg) scale(1.03);
            z-index: 8;
            opacity: 0.85;
          }
          40% { 
            transform: translateY(-40px) translateX(0) rotate(0deg) scale(1.06);
            z-index: 8;
            opacity: 0.8;
          }
          60% { 
            transform: translateY(-15px) translateX(22px) rotate(10deg) scale(1.03);
            z-index: 8;
            opacity: 0.85;
          }
          80% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 3;
            opacity: 0.9;
          }
        }
        
        @keyframes cardShuffle3 {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 2;
            opacity: 0.85;
          }
          20% { 
            transform: translateY(-10px) translateX(-18px) rotate(-7deg) scale(1.02);
            z-index: 7;
            opacity: 0.8;
          }
          40% { 
            transform: translateY(-35px) translateX(0) rotate(0deg) scale(1.04);
            z-index: 7;
            opacity: 0.75;
          }
          60% { 
            transform: translateY(-10px) translateX(18px) rotate(7deg) scale(1.02);
            z-index: 7;
            opacity: 0.8;
          }
          80% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 2;
            opacity: 0.85;
          }
        }
        
        @keyframes cardShuffle4 {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 1;
            opacity: 0.8;
          }
          20% { 
            transform: translateY(-8px) translateX(-15px) rotate(-5deg) scale(1.01);
            z-index: 6;
            opacity: 0.75;
          }
          40% { 
            transform: translateY(-30px) translateX(0) rotate(0deg) scale(1.02);
            z-index: 6;
            opacity: 0.7;
          }
          60% { 
            transform: translateY(-8px) translateX(15px) rotate(5deg) scale(1.01);
            z-index: 6;
            opacity: 0.75;
          }
          80% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            z-index: 1;
            opacity: 0.8;
          }
        }
        
        @keyframes shine {
          0% { opacity: 0; transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}
