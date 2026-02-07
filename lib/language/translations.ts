/**
 * Translation strings for WikiFlash
 */

export interface Translations {
  // Header
  appName: string

  // Dashboard
  yourDecks: string
  createNewDeck: string
  createYourFirstDeck: string
  fromWikipedia: string
  cards: string
  due: string
  studyNow: string
  allCaughtUp: string
  allCaughtUpDescription: string
  lastStudied: string
  heroHeading: string
  heroSubheading: string

  // Create Deck Dialog
  createNewDeckTitle: string
  whatDoYouWantToLearn: string
  enterTopicPlaceholder: string
  topicDescription: string
  numberOfFlashcards: string
  custom: string
  generateFlashcards: string
  loading: string

  // Deck Menu
  openMenu: string
  renameDeck: string
  deleteDeck: string

  // Dialogs
  renameDeckTitle: string
  renameDeckDescription: string
  deleteDeckTitle: string
  deleteDeckDescription: string
  cancel: string
  save: string
  delete: string
  exit: string

  // Study Session
  cardOf: string
  exitStudySession: string
  question: string
  answer: string
  showAnswer: string
  veryHard: string
  hard: string
  good: string
  easy: string
  tooEasy: string
  exitStudySessionTitle: string
  exitStudySessionDescription: string

  // Session Complete
  greatWork: string
  sessionComplete: string
  cardsReviewed: string
  accuracy: string
  performanceBreakdown: string
  backToDashboard: string
  continueStudying: string
  studyMoreCards: string

  // How It Works
  howItWorks: string
  enterTopic: string
  enterTopicDescription: string
  aiGenerates: string
  aiGeneratesDescription: string
  studyMaster: string
  studyMasterDescription: string

  // Errors/Messages
  noCardsAvailable: string
  noCardsDue: string
  allCaughtUpMessage: string
  comeBackTomorrow: string
  nextReview: string
  loadingYourDecks: string
  deckName: string
  extractingPageTitle: string
  fetchingWikipediaPage: string
  parsingArticleContent: string
  articleLoadedSuccessfully: string
  searchingWikipedia: string
  loadingArticle: string
  noUpcomingReviews: string
  back: string
  reviewYourFlashcards: string
  cardsGeneratedFor: string
  editCard: string
  deleteCard: string
  regenerate: string
  saveDeck: string
  editFlashcard: string
  modifyCardDescription: string
  enterQuestion: string
  enterAnswer: string
  saveChanges: string
  generatingFlashcards: string
  generating: string
  about: string
  cancelGeneration: string
  error: string
  goBackToRegenerate: string
  close: string
  wikipediaArticleSuggestions: string
}

export const translations: Record<'en' | 'es', Translations> = {
  en: {
    appName: 'WikiFlash',
    yourDecks: 'Your Decks',
    createNewDeck: 'Create New Deck',
    createYourFirstDeck: 'Create Your First Deck',
    fromWikipedia: 'from Wikipedia',
    cards: 'cards',
    due: 'due',
    studyNow: 'Study Now',
    allCaughtUp: 'All caught up!',
    allCaughtUpDescription: "You've reviewed everything scheduled for today.",
    lastStudied: 'Last studied:',
    heroHeading: 'Turn Wikipedia into Flashcards',
    heroSubheading: 'Master any topic with AI-generated flashcards and spaced repetition',
    createNewDeckTitle: 'Create New Deck',
    whatDoYouWantToLearn: 'What do you want to learn?',
    enterTopicPlaceholder: 'Enter topic or paste Wikipedia URL',
    topicDescription: 'e.g., Ancient Rome, Photosynthesis, Machine Learning',
    numberOfFlashcards: 'Number of flashcards:',
    custom: 'Custom:',
    generateFlashcards: 'Generate Flashcards',
    loading: 'Loading...',
    openMenu: 'Open menu',
    renameDeck: 'Rename Deck',
    deleteDeck: 'Delete Deck',
    renameDeckTitle: 'Rename Deck',
    renameDeckDescription: 'Enter a new name for this deck.',
    deleteDeckTitle: 'Delete Deck',
    deleteDeckDescription: 'This will delete the deck and all cards. This action cannot be undone.',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    exit: 'Exit',
    cardOf: 'Card',
    exitStudySession: 'Exit study session',
    question: 'Question',
    answer: 'Answer',
    showAnswer: 'Show Answer',
    veryHard: 'Very Hard',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
    tooEasy: 'Too Easy',
    exitStudySessionTitle: 'Exit Study Session?',
    exitStudySessionDescription: "Cards you've already reviewed have been saved. You can continue studying later.",
    greatWork: 'Great work!',
    sessionComplete: 'Session Complete',
    cardsReviewed: 'Cards Reviewed',
    accuracy: 'Accuracy',
    performanceBreakdown: 'Performance Breakdown',
    backToDashboard: 'Back to Dashboard',
    continueStudying: 'Continue Studying',
    studyMoreCards: 'Study More Cards',
    howItWorks: 'How It Works',
    enterTopic: 'Enter Topic',
    enterTopicDescription: 'Type any Wikipedia subject or paste a URL',
    aiGenerates: 'AI Generates',
    aiGeneratesDescription: 'Smart flashcards created in seconds',
    studyMaster: 'Study & Master',
    studyMasterDescription: 'Learn with proven spaced repetition',
    noCardsAvailable: 'No cards available',
    noCardsDue: 'No cards are due for review in this deck right now.',
    allCaughtUpMessage: "You've reviewed everything scheduled for today.",
    comeBackTomorrow: 'Come back tomorrow!',
    nextReview: 'Next review:',
    loadingYourDecks: 'Loading your decks...',
    deckName: 'Deck name',
    extractingPageTitle: 'Extracting page title from URL...',
    fetchingWikipediaPage: 'Fetching Wikipedia page...',
    parsingArticleContent: 'Parsing article content...',
    articleLoadedSuccessfully: 'Article loaded successfully!',
    searchingWikipedia: 'Searching Wikipedia for',
    loadingArticle: 'Loading article:',
    noUpcomingReviews: 'No upcoming reviews',
    back: 'Back',
    reviewYourFlashcards: 'Review Your Flashcards',
    cardsGeneratedFor: 'cards generated for',
    editCard: 'Edit card',
    deleteCard: 'Delete card',
    regenerate: 'Regenerate',
    saveDeck: 'Save Deck',
    editFlashcard: 'Edit Flashcard',
    modifyCardDescription: 'Modify the question and answer for this card.',
    enterQuestion: 'Enter question',
    enterAnswer: 'Enter answer',
    saveChanges: 'Save Changes',
    generatingFlashcards: 'Generating flashcards, please wait',
    generating: 'Generating',
    about: 'about',
    cancelGeneration: 'Cancel generation',
    error: 'Error:',
    goBackToRegenerate: 'Go back to regenerate flashcards',
    close: 'Close',
    wikipediaArticleSuggestions: 'Wikipedia article suggestions',
  },
  es: {
    appName: 'WikiFlash',
    yourDecks: 'Tus Barajas',
    createNewDeck: 'Crear Nueva Baraja',
    createYourFirstDeck: 'Crea Tu Primera Baraja',
    fromWikipedia: 'de Wikipedia',
    cards: 'tarjetas',
    due: 'pendientes',
    studyNow: 'Estudiar Ahora',
    allCaughtUp: '¡Todo al día!',
    allCaughtUpDescription: 'Has revisado todo lo programado para hoy.',
    lastStudied: 'Último estudio:',
    heroHeading: 'Convierte Wikipedia en Tarjetas de Estudio',
    heroSubheading: 'Domina cualquier tema con tarjetas generadas por IA y repetición espaciada',
    createNewDeckTitle: 'Crear Nueva Baraja',
    whatDoYouWantToLearn: '¿Qué quieres aprender?',
    enterTopicPlaceholder: 'Ingresa un tema o pega una URL de Wikipedia',
    topicDescription: 'ej., Antigua Roma, Fotosíntesis, Aprendizaje Automático',
    numberOfFlashcards: 'Número de tarjetas:',
    custom: 'Personalizado:',
    generateFlashcards: 'Generar Tarjetas',
    loading: 'Cargando...',
    openMenu: 'Abrir menú',
    renameDeck: 'Renombrar Baraja',
    deleteDeck: 'Eliminar Baraja',
    renameDeckTitle: 'Renombrar Baraja',
    renameDeckDescription: 'Ingresa un nuevo nombre para esta baraja.',
    deleteDeckTitle: 'Eliminar Baraja',
    deleteDeckDescription: 'Esto eliminará la baraja y todas las tarjetas. Esta acción no se puede deshacer.',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    exit: 'Salir',
    cardOf: 'Tarjeta',
    exitStudySession: 'Salir de la sesión de estudio',
    question: 'Pregunta',
    answer: 'Respuesta',
    showAnswer: 'Mostrar Respuesta',
    veryHard: 'Muy Difícil',
    hard: 'Difícil',
    good: 'Bien',
    easy: 'Fácil',
    tooEasy: 'Muy Fácil',
    exitStudySessionTitle: '¿Salir de la Sesión de Estudio?',
    exitStudySessionDescription: 'Las tarjetas que ya has revisado se han guardado. Puedes continuar estudiando más tarde.',
    greatWork: '¡Excelente trabajo!',
    sessionComplete: 'Sesión Completa',
    cardsReviewed: 'Tarjetas Revisadas',
    accuracy: 'Precisión',
    performanceBreakdown: 'Desglose de Rendimiento',
    backToDashboard: 'Volver al Panel',
    continueStudying: 'Continuar Estudiando',
    studyMoreCards: 'Estudiar Más Tarjetas',
    howItWorks: 'Cómo Funciona',
    enterTopic: 'Ingresa un Tema',
    enterTopicDescription: 'Escribe cualquier tema de Wikipedia o pega una URL',
    aiGenerates: 'IA Genera',
    aiGeneratesDescription: 'Tarjetas inteligentes creadas en segundos',
    studyMaster: 'Estudia y Domina',
    studyMasterDescription: 'Aprende con repetición espaciada probada',
    noCardsAvailable: 'No hay tarjetas disponibles',
    noCardsDue: 'No hay tarjetas pendientes de revisar en esta baraja en este momento.',
    allCaughtUpMessage: 'Has revisado todo lo programado para hoy.',
    comeBackTomorrow: '¡Vuelve mañana!',
    nextReview: 'Próxima revisión:',
    loadingYourDecks: 'Cargando tus barajas...',
    deckName: 'Nombre de la baraja',
    extractingPageTitle: 'Extrayendo título de la página de la URL...',
    fetchingWikipediaPage: 'Obteniendo página de Wikipedia...',
    parsingArticleContent: 'Analizando contenido del artículo...',
    articleLoadedSuccessfully: '¡Artículo cargado exitosamente!',
    searchingWikipedia: 'Buscando en Wikipedia',
    loadingArticle: 'Cargando artículo:',
    noUpcomingReviews: 'No hay revisiones próximas',
    back: 'Atrás',
    reviewYourFlashcards: 'Revisa Tus Tarjetas',
    cardsGeneratedFor: 'tarjetas generadas para',
    editCard: 'Editar tarjeta',
    deleteCard: 'Eliminar tarjeta',
    regenerate: 'Regenerar',
    saveDeck: 'Guardar Baraja',
    editFlashcard: 'Editar Tarjeta',
    modifyCardDescription: 'Modifica la pregunta y respuesta de esta tarjeta.',
    enterQuestion: 'Ingresa la pregunta',
    enterAnswer: 'Ingresa la respuesta',
    saveChanges: 'Guardar Cambios',
    generatingFlashcards: 'Generando tarjetas, por favor espera',
    generating: 'Generando',
    about: 'sobre',
    cancelGeneration: 'Cancelar generación',
    error: 'Error:',
    goBackToRegenerate: 'Volver para regenerar tarjetas',
    close: 'Cerrar',
    wikipediaArticleSuggestions: 'Sugerencias de artículos de Wikipedia',
  },
}

/**
 * Get translation for current language
 */
export function useTranslations(language: 'en' | 'es'): Translations {
  return translations[language]
}

