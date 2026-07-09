/**
 * AI prompt engineering for flashcard generation
 */

export type QuestionType = 'recall' | 'comparison' | 'causal' | 'socratic' | 'practical'

export type GenerationProfile = 'quick_review' | 'deep_understanding' | 'balanced'

export interface FlashcardPromptInput {
  content: string
  topic: string
  count: number
  language?: 'en' | 'es'
  sourceLanguage?: 'en' | 'es'
  profile?: GenerationProfile
}

/** Target distribution for each profile (percentages). Model may redistribute if content doesn't support certain types. */
export const PROFILE_DISTRIBUTIONS: Record<GenerationProfile, Record<QuestionType, number>> = {
  quick_review: { recall: 50, comparison: 25, causal: 15, socratic: 5, practical: 5 },
  deep_understanding: { recall: 15, comparison: 15, causal: 30, socratic: 25, practical: 15 },
  balanced: { recall: 30, comparison: 20, causal: 25, socratic: 15, practical: 10 },
}

const VALID_TYPES: QuestionType[] = ['recall', 'comparison', 'causal', 'socratic', 'practical']

export function isValidQuestionType(t: string): t is QuestionType {
  return (VALID_TYPES as string[]).includes(t)
}

// ponytail: strip injection attempts from user-controlled fields interpolated into prompts
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/["'`\\]/g, '') // strip quotes and backslashes
    .replace(/\n{3,}/g, '\n\n') // limit newlines
    .slice(0, 500) // hard cap
}

/**
 * Generate the system prompt for flashcard generation
 */
export function getSystemPrompt(language: 'en' | 'es' = 'en'): string {
  const lang = language === 'es' ? 'es' : 'en'

  const typeDefinitions = lang === 'es'
    ? `TIPOS DE PREGUNTA — cada tarjeta DEBE tener un campo "type" con uno de estos valores:

1. "recall" — Recordar hechos, definiciones, datos específicos, fechas, nombres.
   Ejemplo: ¿En qué año se fundó la RAE? → 1713.

2. "comparison" — Distinguir diferencias o similitudes entre conceptos relacionados.
   Ejemplo: ¿Cómo difiere el aprendizaje supervisado del no supervisado?

3. "causal" — Entender causas, efectos, consecuencias, por qué algo sucede.
   Ejemplo: ¿Por qué la Revolución Francesa transformó el sistema político europeo?

4. "socratic" — Cuestionar supuestos, razonar sobre implicaciones, explorar "¿qué pasaría si...?"
   Ejemplo: ¿Qué ocurriría con la fotosíntesis si la luz solar fuera monocromática?

5. "practical" — Aplicar conocimiento a situaciones concretas, casos reales, problemas prácticos.
   Ejemplo: ¿Cómo se aplicaría el principio de Pareto en la gestión de un equipo de desarrollo?`
    : `QUESTION TYPES — each card MUST have a "type" field with one of these values:

1. "recall" — Remembering facts, definitions, specific data, dates, names.
   Example: What year was the RAE founded? → 1713.

2. "comparison" — Distinguishing differences or similarities between related concepts.
   Example: How does supervised learning differ from unsupervised learning?

3. "causal" — Understanding causes, effects, consequences, why something happens.
   Example: Why did the French Revolution transform the European political system?

4. "socratic" — Questioning assumptions, reasoning about implications, exploring "what if...?"
   Example: What would happen to photosynthesis if sunlight were monochromatic?

5. "practical" — Applying knowledge to concrete situations, real cases, practical problems.
   Example: How would you apply the Pareto principle in a development team?`

  const rules = lang === 'es'
    ? `REGLAS ESTRICTAS:
- Las respuestas deben ser de 1-2 oraciones MÁXIMO. Solo lo esencial, sin relleno.
- Las preguntas deben hacer pensar, no solo recordar. Evita "¿Qué es X?" directas.
- Cada pregunta debe conectar conceptos o exigir razonamiento.
- Si el contenido no permite un tipo de pregunta (ej: artículo biográfico sin procesos), redistribuye entre los tipos que sí funcionen.
- NO inventes información que no esté en el contenido.
- JSON output ONLY, sin texto adicional.`
    : `STRICT RULES:
- Answers must be 1-2 sentences MAXIMUM. Essential information only, no filler.
- Questions must make the learner think, not just recall. Avoid direct "What is X?" questions.
- Each question should connect concepts or require reasoning.
- If the content doesn't support a question type (e.g., biographical article without processes), redistribute among types that work.
- Do NOT invent information not in the content.
- JSON output ONLY, no additional text.`

  return `You are an expert pedagogical flashcard creator. Your flashcards prepare learners to answer ANY exam question — not just memorize, but reason deeply about the topic.

The content may be in a different language than the flashcards. Always generate questions and answers in the target language.

${typeDefinitions}

${rules}

CRITICAL: Return ONLY a valid JSON array. Each element must have "question", "answer", and "type" fields.

Format:
[
  {"question": "...", "answer": "...", "type": "recall"},
  {"question": "...", "answer": "...", "type": "causal"}
]

Start with [ and end with ]. No markdown, no code blocks, no text before or after.`
}

/**
 * Generate the user prompt with content and requirements
 */
export function getUserPrompt(input: FlashcardPromptInput): string {
  const langNames: Record<string, string> = { en: 'English', es: 'Spanish' }
  const targetName = langNames[input.language ?? 'en'] ?? input.language
  const sourceName = input.sourceLanguage ? langNames[input.sourceLanguage] : null
  const profile = input.profile ?? 'balanced'
  const dist = PROFILE_DISTRIBUTIONS[profile]

  const lang = input.language === 'es' ? 'es' : 'en'

  const languageInstruction = lang === 'es'
    ? 'IMPORTANTE: Todas las preguntas y respuestas deben estar completamente en español.'
    : 'IMPORTANT: All questions and answers must be in English.'

  const sourceNote = sourceName && sourceName !== targetName
    ? `\nNOTE: The article content below is in ${sourceName}. You must still generate all questions and answers in ${targetName}.`
    : ''

  const profileName = lang === 'es'
    ? { quick_review: 'Repaso rápido', deep_understanding: 'Comprensión profunda', balanced: 'Balanceado' }[profile]
    : { quick_review: 'Quick review', deep_understanding: 'Deep understanding', balanced: 'Balanced' }[profile]

  const distDescription = lang === 'es'
    ? `aproximadamente ${dist.recall}% recall, ${dist.comparison}% comparison, ${dist.causal}% causal, ${dist.socratic}% socratic, ${dist.practical}% practical`
    : `approximately ${dist.recall}% recall, ${dist.comparison}% comparison, ${dist.causal}% causal, ${dist.socratic}% socratic, ${dist.practical}% practical`

  const rules = lang === 'es'
    ? `- Genera EXACTAMENTE ${input.count} tarjetas
- Cada tarjeta tiene "question", "answer" y "type" (recall|comparison|causal|socratic|practical)
- Respuestas de 1-2 oraciones MÁXIMO — sin relleno, solo lo esencial
- Preguntas que exijan razonamiento, no solo repetir定义
- Distribución por perfil "${profileName}": ${distDescription} (redistribuye si el contenido no da para ciertos tipos)
- ${languageInstruction}
- Solo JSON, sin texto adicional`
    : `- Generate EXACTLY ${input.count} cards
- Each card has "question", "answer", and "type" (recall|comparison|causal|socratic|practical)
- Answers 1-2 sentences MAXIMUM — no filler, essential info only
- Questions must require reasoning, not just repetition
- Distribution for profile "${profileName}": ${distDescription} (redistribute if content doesn't support certain types)
- ${languageInstruction}
- JSON only, no additional text`

  return `Create flashcards from the following Wikipedia article about "${sanitizeForPrompt(input.topic)}":${sourceNote}

${input.content}

${rules}

CRITICAL: Return ONLY a JSON array starting with [ and ending with ]. Each element: {"question": "...", "answer": "...", "type": "..."}.

Your response must start with [ and end with ].`
}
