'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Khôi phục ngôn ngữ từ localStorage khi component mount
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('selectedLanguage')
      if (savedLanguage && ['vi', 'en', 'zh', 'ja', 'ko'].includes(savedLanguage)) {
        if (i18n.language !== savedLanguage) {
          i18n.changeLanguage(savedLanguage)
        }
      }
    }
    setMounted(true)
  }, [i18n])

  // Lắng nghe sự kiện thay đổi ngôn ngữ để lưu vào localStorage
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedLanguage', lng)
      }
    }

    i18n.on('languageChanged', handleLanguageChange)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}