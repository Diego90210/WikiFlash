"use client"

import { useLanguage } from './context'
import { useTranslations as useTranslationsInternal } from './translations'

/**
 * Hook to get translations for the current language
 */
export function useTranslations() {
  const { language } = useLanguage()
  return useTranslationsInternal(language)
}

