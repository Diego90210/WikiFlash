/**
 * AI prompt engineering for flashcard generation
 */

export interface FlashcardPromptInput {
  content: string
  topic: string
  count: number
}

/**
 * Generate the system prompt for flashcard generation
 */
export function getSystemPrompt(): string {
  return `You are an expert educational content creator specializing in creating high-quality flashcards for spaced repetition learning.

Your task is to create flashcards from the provided Wikipedia article content. Each flashcard should:
1. Test understanding of key concepts, facts, definitions, dates, causes/effects, or relationships
2. Have a clear, concise question that can be answered from the content
3. Have a comprehensive answer that explains the concept clearly
4. Focus on important information that helps with learning and retention

Guidelines:
- Create diverse question types: definitions, examples, facts, dates, causes/effects, comparisons
- Questions should be specific and testable
- Answers should be informative but concise (2-4 sentences typically)
- Avoid trivial or overly obvious questions
- Prioritize information that is central to understanding the topic
- Ensure questions and answers are factually accurate based on the provided content

CRITICAL: You must return ONLY a valid JSON array. Do not wrap it in an object. Do not include markdown code blocks. Do not include any explanatory text.

Return format (JSON array only):
[
  {"question": "Question text here", "answer": "Answer text here"},
  {"question": "Another question", "answer": "Another answer"}
]

Start your response with [ and end with ]. No other text before or after.`
}

/**
 * Generate the user prompt with content and requirements
 */
export function getUserPrompt(input: FlashcardPromptInput): string {
  return `Create exactly ${input.count} high-quality flashcards from the following Wikipedia article about "${input.topic}":

${input.content}

Requirements:
- Generate exactly ${input.count} flashcards
- Each flashcard must have a "question" and "answer" field
- Questions should test understanding of key concepts, facts, definitions, dates, or relationships
- Answers should be informative and based on the provided content
- Return ONLY a valid JSON array, no additional text

CRITICAL: Return ONLY a JSON array starting with [ and ending with ]. No markdown, no code blocks, no explanatory text.

Format:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]

Your response must start with [ and end with ].`
}
