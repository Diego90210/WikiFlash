export function AbstractShapes() {
  return (
    <div className="abstract-shapes-container w-full max-w-[500px] mx-auto mb-12 md:mb-16">
      <svg
        viewBox="300 0 600 500"
        xmlns="http://www.w3.org/2000/svg"
        className="abstract-shapes w-full h-auto"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FFE66D", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#F4D03F", stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--secondary))", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--secondary))", stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#F39C6B", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#E67E50", stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="tealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 0.8 }} />
          </linearGradient>
          <radialGradient id="radialYellow">
            <stop offset="0%" style={{ stopColor: "#FFF4A3", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#F4D03F", stopOpacity: 1 }} />
          </radialGradient>
        </defs>

        {/* Orange square with texture */}
        <g id="orange-square-1">
          <rect x="302" y="32" width="70" height="70" fill="url(#orangeGrad)" rx="3" />
          <rect x="305" y="35" width="64" height="3" fill="#F39C6B" opacity="0.4" />
          <rect x="305" y="65" width="64" height="3" fill="#D66A40" opacity="0.3" />
        </g>

        {/* Teal arches with enhanced detail */}
        <g id="teal-arches">
          <path
            d="M 392 67 Q 427 32 462 67"
            stroke="hsl(var(--accent))"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 392 67 Q 427 32 462 67"
            stroke="hsl(var(--accent))"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 397 62 Q 427 37 457 62"
            stroke="hsl(var(--accent))"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 397 62 Q 427 37 457 62"
            stroke="hsl(var(--accent))"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 402 57 Q 427 42 452 57"
            stroke="hsl(var(--accent))"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 402 57 Q 427 42 452 57"
            stroke="hsl(var(--accent))"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Blue arches with depth */}
        <g id="blue-arches">
          <path
            d="M 482 67 Q 517 32 552 67"
            stroke="hsl(var(--primary))"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 482 67 Q 517 32 552 67"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 487 62 Q 517 37 547 62"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 487 62 Q 517 37 547 62"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 492 57 Q 517 42 542 57"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 492 57 Q 517 42 542 57"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Pink spiral with multiple rings */}
        <g id="pink-spiral">
          <circle cx="612" cy="67" r="35" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" opacity="0.8" />
          <circle cx="612" cy="67" r="35" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" opacity="0.4" />
          <circle cx="612" cy="67" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" opacity="0.7" />
          <circle cx="612" cy="67" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" opacity="0.3" />
          <circle cx="612" cy="67" r="21" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" opacity="0.6" />
          <circle cx="612" cy="67" r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" opacity="0.5" />
          <circle cx="612" cy="67" r="7" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" opacity="0.4" />
          <circle cx="612" cy="67" r="3" fill="hsl(var(--secondary))" />
        </g>

        {/* Orange asterisk with glow */}
        <g id="orange-asterisk">
          <g opacity="0.2">
            <rect x="693" y="50" width="16" height="34" fill="#F39C6B" rx="2" transform="rotate(0 701 67)" />
            <rect x="693" y="50" width="16" height="34" fill="#F39C6B" rx="2" transform="rotate(45 701 67)" />
            <rect x="693" y="50" width="16" height="34" fill="#F39C6B" rx="2" transform="rotate(90 701 67)" />
            <rect x="693" y="50" width="16" height="34" fill="#F39C6B" rx="2" transform="rotate(135 701 67)" />
          </g>
          <rect x="695" y="52" width="12" height="30" fill="url(#orangeGrad)" rx="1" transform="rotate(0 701 67)" />
          <rect x="695" y="52" width="12" height="30" fill="url(#orangeGrad)" rx="1" transform="rotate(45 701 67)" />
          <rect x="695" y="52" width="12" height="30" fill="url(#orangeGrad)" rx="1" transform="rotate(90 701 67)" />
          <rect x="695" y="52" width="12" height="30" fill="url(#orangeGrad)" rx="1" transform="rotate(135 701 67)" />
          <circle cx="701" cy="67" r="6" fill="#E67E50" />
        </g>

        {/* White starburst with glow */}
        <g id="white-starburst" className="opacity-60 dark:opacity-80">
          <line
            x1="787"
            y1="67"
            x2="817"
            y2="67"
            stroke="currentColor"
            strokeWidth="5"
            opacity="0.3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="802"
            y1="52"
            x2="802"
            y2="82"
            stroke="currentColor"
            strokeWidth="5"
            opacity="0.3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="791"
            y1="56"
            x2="813"
            y2="78"
            stroke="currentColor"
            strokeWidth="5"
            opacity="0.3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="813"
            y1="56"
            x2="791"
            y2="78"
            stroke="currentColor"
            strokeWidth="5"
            opacity="0.3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="787"
            y1="67"
            x2="817"
            y2="67"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="802"
            y1="52"
            x2="802"
            y2="82"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="791"
            y1="56"
            x2="813"
            y2="78"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="813"
            y1="56"
            x2="791"
            y2="78"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-foreground"
          />
          <circle cx="802" cy="67" r="4" fill="currentColor" className="text-foreground" />
        </g>

        {/* Teal flower with depth */}
        <g id="teal-flower">
          <circle cx="882" cy="47" r="17" fill="hsl(var(--accent))" opacity="0.2" />
          <circle cx="907" cy="67" r="17" fill="hsl(var(--accent))" opacity="0.2" />
          <circle cx="882" cy="87" r="17" fill="hsl(var(--accent))" opacity="0.2" />
          <circle cx="857" cy="67" r="17" fill="hsl(var(--accent))" opacity="0.2" />
          <circle cx="882" cy="47" r="15" fill="url(#tealGrad)" />
          <circle cx="907" cy="67" r="15" fill="url(#tealGrad)" />
          <circle cx="882" cy="87" r="15" fill="url(#tealGrad)" />
          <circle cx="857" cy="67" r="15" fill="url(#tealGrad)" />
          <circle cx="882" cy="67" r="8" fill="hsl(var(--accent))" opacity="0.8" />
          <ellipse cx="882" cy="45" rx="8" ry="4" fill="hsl(var(--accent))" opacity="0.3" />
        </g>

        {/* Colored dots row 2 */}
        <g id="colored-dots">
          <circle cx="322" cy="132" r="14" fill="#FFE66D" opacity="0.3" />
          <circle cx="352" cy="132" r="14" fill="hsl(var(--accent))" opacity="0.3" />
          <circle cx="322" cy="162" r="14" fill="#F39C6B" opacity="0.3" />
          <circle cx="352" cy="162" r="14" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="322" cy="132" r="12" fill="url(#yellowGrad)" />
          <circle cx="352" cy="132" r="12" fill="url(#tealGrad)" />
          <circle cx="322" cy="162" r="12" fill="url(#orangeGrad)" />
          <circle cx="352" cy="162" r="12" fill="url(#blueGrad)" />
          <circle cx="322" cy="128" rx="6" ry="3" fill="#FFF4A3" opacity="0.5" />
          <circle cx="352" cy="128" rx="6" ry="3" fill="hsl(var(--accent))" opacity="0.4" />
        </g>

        {/* Teal arch pattern */}
        <g id="teal-arch-pattern">
          <path d="M 392 192 Q 427 157 462 192 L 462 117 L 392 117 Z" fill="url(#tealGrad)" />
          <path d="M 395 190 Q 427 160 459 190" stroke="hsl(var(--accent))" strokeWidth="1" fill="none" opacity="0.3" />
          <path
            d="M 397 187 Q 427 162 457 187"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            opacity="0.2"
            strokeLinecap="round"
            className="text-background"
          />
          <path
            d="M 397 187 Q 427 162 457 187"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="text-background"
            opacity="0.8"
          />
          <path
            d="M 402 182 Q 427 167 452 182"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            opacity="0.15"
            strokeLinecap="round"
            className="text-background"
          />
          <path
            d="M 402 182 Q 427 167 452 182"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="text-background"
            opacity="0.6"
          />
        </g>

        {/* Yellow lines with glow */}
        <g id="yellow-lines">
          <line
            x1="592"
            y1="117"
            x2="592"
            y2="157"
            stroke="#FFE66D"
            strokeWidth="6"
            opacity="0.4"
            strokeLinecap="round"
          />
          <line
            x1="607"
            y1="117"
            x2="607"
            y2="157"
            stroke="#FFE66D"
            strokeWidth="6"
            opacity="0.4"
            strokeLinecap="round"
          />
          <line
            x1="622"
            y1="117"
            x2="622"
            y2="157"
            stroke="#FFE66D"
            strokeWidth="6"
            opacity="0.4"
            strokeLinecap="round"
          />
          <line x1="592" y1="117" x2="592" y2="157" stroke="url(#yellowGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="607" y1="117" x2="607" y2="157" stroke="url(#yellowGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="622" y1="117" x2="622" y2="157" stroke="url(#yellowGrad)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="592" cy="117" r="3" fill="#FFF4A3" />
          <circle cx="607" cy="117" r="3" fill="#FFF4A3" />
          <circle cx="622" cy="117" r="3" fill="#FFF4A3" />
        </g>

        {/* Teal flower 2 */}
        <g id="teal-flower-2">
          <circle cx="697" cy="154" r="32" fill="hsl(var(--accent))" opacity="0.2" />
          <circle cx="697" cy="154" r="30" fill="url(#tealGrad)" />
          <circle cx="697" cy="134" r="10" fill="hsl(var(--accent))" opacity="0.3" />
          <circle cx="717" cy="154" r="10" fill="hsl(var(--accent))" opacity="0.3" />
          <circle cx="697" cy="174" r="10" fill="hsl(var(--accent))" opacity="0.3" />
          <circle cx="677" cy="154" r="10" fill="hsl(var(--accent))" opacity="0.3" />
          <circle cx="697" cy="134" r="8" fill="hsl(var(--accent))" />
          <circle cx="717" cy="154" r="8" fill="hsl(var(--accent))" />
          <circle cx="697" cy="174" r="8" fill="hsl(var(--accent))" />
          <circle cx="677" cy="154" r="8" fill="hsl(var(--accent))" />
          <circle cx="697" cy="154" r="15" fill="hsl(var(--accent))" opacity="0.7" />
          <ellipse cx="697" cy="148" rx="10" ry="5" fill="hsl(var(--accent))" opacity="0.3" />
        </g>

        {/* White starburst 2 */}
        <g id="white-starburst-2" className="opacity-60 dark:opacity-80">
          <g opacity="0.3">
            <line
              x1="787"
              y1="154"
              x2="817"
              y2="154"
              stroke="currentColor"
              strokeWidth="4"
              className="text-foreground"
            />
            <line
              x1="802"
              y1="139"
              x2="802"
              y2="169"
              stroke="currentColor"
              strokeWidth="4"
              className="text-foreground"
            />
            <line
              x1="791"
              y1="143"
              x2="813"
              y2="165"
              stroke="currentColor"
              strokeWidth="4"
              className="text-foreground"
            />
            <line
              x1="813"
              y1="143"
              x2="791"
              y2="165"
              stroke="currentColor"
              strokeWidth="4"
              className="text-foreground"
            />
            <line
              x1="795"
              y1="139"
              x2="809"
              y2="169"
              stroke="currentColor"
              strokeWidth="4"
              className="text-foreground"
            />
            <line
              x1="809"
              y1="139"
              x2="795"
              y2="169"
              stroke="currentColor"
              strokeWidth="4"
              className="text-foreground"
            />
          </g>
          <line
            x1="787"
            y1="154"
            x2="817"
            y2="154"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="802"
            y1="139"
            x2="802"
            y2="169"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="791"
            y1="143"
            x2="813"
            y2="165"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="813"
            y1="143"
            x2="791"
            y2="165"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="795"
            y1="139"
            x2="809"
            y2="169"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
          />
          <line
            x1="809"
            y1="139"
            x2="795"
            y2="169"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
          />
          <circle cx="802" cy="154" r="4" fill="currentColor" className="text-foreground" />
        </g>
      </svg>
    </div>
  )
}
