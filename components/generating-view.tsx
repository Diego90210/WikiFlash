"use client"

type GeneratingViewProps = {
  topic: string
  cardCount: number
}

export function GeneratingView({ topic, cardCount }: GeneratingViewProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8 relative">
          <div className="w-32 h-40 mx-auto relative">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 bg-card border-2 border-primary rounded-lg shadow-lg"
                style={{
                  animation: `shuffle-${i} 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-foreground text-balance">
          Generating {cardCount} flashcards about {topic}...
        </h2>
        <p className="text-muted-foreground">This will only take a moment</p>
      </div>

      <style jsx>{`
        @keyframes shuffle-0 {
          0%, 100% { transform: translateY(0) rotate(0deg); z-index: 5; }
          25% { transform: translateY(-20px) translateX(-30px) rotate(-15deg); z-index: 10; }
          50% { transform: translateY(-40px) translateX(0) rotate(0deg); z-index: 10; }
          75% { transform: translateY(-20px) translateX(30px) rotate(15deg); z-index: 10; }
        }
        @keyframes shuffle-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); z-index: 4; }
          25% { transform: translateY(-15px) translateX(-25px) rotate(-12deg); z-index: 9; }
          50% { transform: translateY(-35px) translateX(0) rotate(0deg); z-index: 9; }
          75% { transform: translateY(-15px) translateX(25px) rotate(12deg); z-index: 9; }
        }
        @keyframes shuffle-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); z-index: 3; }
          25% { transform: translateY(-10px) translateX(-20px) rotate(-8deg); z-index: 8; }
          50% { transform: translateY(-30px) translateX(0) rotate(0deg); z-index: 8; }
          75% { transform: translateY(-10px) translateX(20px) rotate(8deg); z-index: 8; }
        }
        @keyframes shuffle-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); z-index: 2; }
          25% { transform: translateY(-5px) translateX(-15px) rotate(-5deg); z-index: 7; }
          50% { transform: translateY(-25px) translateX(0) rotate(0deg); z-index: 7; }
          75% { transform: translateY(-5px) translateX(15px) rotate(5deg); z-index: 7; }
        }
        @keyframes shuffle-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); z-index: 1; }
          25% { transform: translateY(-3px) translateX(-10px) rotate(-3deg); z-index: 6; }
          50% { transform: translateY(-20px) translateX(0) rotate(0deg); z-index: 6; }
          75% { transform: translateY(-3px) translateX(10px) rotate(3deg); z-index: 6; }
        }
      `}</style>
    </div>
  )
}
