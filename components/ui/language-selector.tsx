'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '/flag-vietnam.webp' },
  { code: 'en', name: 'English', flag: '/flag-united-state.png' },
  { code: 'zh', name: '中文', flag: '/flag-china.png' },
]

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button 
        variant="outline" 
        size="sm" 
        className="w-10 h-10 p-0 flex items-center justify-center"
      >
        <img
          src={currentLanguage.flag}
          alt={currentLanguage.name}
          className="w-6 h-6 object-cover rounded"
        />
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-[160px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md text-left"
            >
              <img
                src={language.flag}
                alt={language.name}
                className="w-5 h-5 object-cover rounded mr-2"
              />
              <span className="text-sm">{language.name}</span>
              {language.code === i18n.language && (
                <span className="ml-auto text-xs text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}