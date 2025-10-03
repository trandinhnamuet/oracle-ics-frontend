"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menu, X, User, LogOut, Settings } from "lucide-react"
import { SimpleDropdown } from "@/components/ui/simple-dropdown"
import { LanguageSelector } from "@/components/ui/language-selector"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import useAuthStore from "@/hooks/use-auth-store"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/api/auth.api"

export function Header() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout, setLoading, setError, initAuth } = useAuthStore()

  // Khởi tạo auth khi component mount
  useEffect(() => {
    initAuth()
  }, [initAuth])

  const handleLogout = async () => {
    try {
      setLoading(true)
      await authApi.logout()
      logout()
      toast({
        title: t('common.logoutSuccess'),
        variant: 'success'
      })
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginClick = () => {
    router.push('/login')
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  // Scroll mượt đến section
  const handleSmoothScroll = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Scroll lên đầu trang
  const handleHomeClick = () => {
    if (window.location.pathname !== "/") {
      router.push("/")
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            {/* Oracle SVG Logo */}
            <span className="h-10 w-10 block">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 20">
                <g fill="#E55844">
                  <path d="M9.9,20.1c-5.5,0-9.9-4.4-9.9-9.9c0-5.5,4.4-9.9,9.9-9.9h11.6c5.5,0,9.9,4.4,9.9,9.9c0,5.5-4.4,9.9-9.9,9.9H9.9 M21.2,16.6c3.6,0,6.4-2.9,6.4-6.4c0-3.6-2.9-6.4-6.4-6.4h-11c-3.6,0-6.4,2.9-6.4,6.4s2.9,6.4,6.4,6.4H21.2"/>
                </g>
              </svg>
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('header.logoTitle')}</h1>
              <p className="text-xs text-muted-foreground">{t('header.logoSubtitle')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              type="button"
              className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0"
              onClick={handleHomeClick}
            >
              {t('header.home')}
            </button>
            <button
              type="button"
              className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0"
              onClick={() => {
                if (window.location.pathname !== "/") {
                  router.push("/?scroll=services")
                } else {
                  handleSmoothScroll('services')
                }
              }}
            >
              {t('header.services')}
            </button>
            <button
              type="button"
              className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0"
              onClick={() => {
                if (window.location.pathname !== "/") {
                  router.push("/?scroll=pricing")
                } else {
                  handleSmoothScroll('pricing')
                }
              }}
            >
              {t('header.pricing')}
            </button>
            <button
              type="button"
              className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0"
              onClick={() => {
                if (window.location.pathname !== "/") {
                  router.push("/?scroll=support")
                } else {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
                }
              }}
            >
              {t('header.support')}
            </button>
            <button
              type="button"
              className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0"
              onClick={() => router.push('/contact-info')}
            >
              {t('header.contact')}
            </button>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <SimpleDropdown 
                  user={user}
                  onProfileClick={handleProfileClick}
                  onLogout={handleLogout}
                />
                <LanguageSelector />
                <ThemeToggle />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleLoginClick}>
                  {t('header.login')}
                </Button>
                <Button asChild>
                  <Link href="/register">{t('header.register')}</Link>
                </Button>
                <LanguageSelector />
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-3">
              <button
                type="button"
                className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0 text-left"
                onClick={() => { setIsMenuOpen(false); handleHomeClick() }}
              >
                {t('header.home')}
              </button>
              <button
                type="button"
                className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0 text-left"
                onClick={() => { setIsMenuOpen(false); handleSmoothScroll('services') }}
              >
                {t('header.services')}
              </button>
              <button
                type="button"
                className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0 text-left"
                onClick={() => { setIsMenuOpen(false); handleSmoothScroll('pricing') }}
              >
                {t('header.pricing')}
              </button>
              <button
                type="button"
                className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0 text-left"
                onClick={() => { setIsMenuOpen(false); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) }}
              >
                {t('header.support')}
              </button>
              <button
                type="button"
                className="text-foreground hover:text-primary transition-colors font-medium bg-transparent border-none px-0 text-left"
                onClick={() => { setIsMenuOpen(false); router.push('/contact-info') }}
              >
                {t('header.contact')}
              </button>
            </nav>
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-foreground">
                      <User className="h-4 w-4" />
                      <span>{t('header.hello')}, {user.firstName || user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LanguageSelector />
                      <ThemeToggle />
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleProfileClick} className="w-full bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    {t('header.profile')}
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('header.logout')}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('header.languageLabel')}</span>
                    <div className="flex items-center space-x-2">
                      <LanguageSelector />
                      <ThemeToggle />
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleLoginClick} className="w-full bg-transparent">
                    {t('header.login')}
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">{t('header.register')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
