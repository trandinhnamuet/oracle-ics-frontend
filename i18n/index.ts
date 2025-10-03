import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import vi from './vi.json'
import en from './en.json'
import zh from './zh.json'
import ja from './ja.json'
import ko from './ko.json'

// Lấy ngôn ngữ từ localStorage hoặc sử dụng mặc định
const getStoredLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('selectedLanguage')
    if (stored && ['vi', 'en', 'zh', 'ja', 'ko'].includes(stored)) {
      return stored
    }
  }
  return 'vi' // Ngôn ngữ mặc định
}

// Lưu ngôn ngữ vào localStorage
const saveLanguage = (lng: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedLanguage', lng)
  }
}

// Khởi tạo i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false // React đã escape HTML
    },
    debug: process.env.NODE_ENV === 'development'
  })

// Lắng nghe sự kiện thay đổi ngôn ngữ để lưu vào localStorage
i18n.on('languageChanged', (lng) => {
  saveLanguage(lng)
})

export default i18n
export { getStoredLanguage, saveLanguage }