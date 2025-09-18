'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Globe, Award } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import useAuthStore from "@/hooks/use-auth-store"

export function HeroSection() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()

  return (
    <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background opacity-50" />
      <div className="absolute inset-0 bg-[url('/abstract-cloud-network-pattern.jpg')] opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm font-medium">
                <Award className="h-4 w-4 mr-2" />
                {t('homepage.hero.subtitle')}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight text-foreground">
                {t('homepage.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                {t('homepage.hero.description')}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-card border border-border">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Bảo mật tuyệt đối</p>
                  <p className="text-xs text-muted-foreground">99.9% uptime</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-card border border-border">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Hiệu suất cao</p>
                  <p className="text-xs text-muted-foreground">Tốc độ vượt trội</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-card border border-border">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Toàn cầu</p>
                  <p className="text-xs text-muted-foreground">36+ data centers</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="text-lg px-8 py-6"
                  onClick={() => {
                    const el = document.getElementById('pricing')
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      window.location.href = '/#pricing'
                    }
                  }}
                >
                  Xem cấu hình và giá
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/login">
                    {t('homepage.hero.getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background"
                >
                  <Link href="/contact-info">
                    {t('homepage.hero.contact')}
                  </Link>
                </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Khách hàng</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Hỗ trợ</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/modern-cloud-infrastructure-dashboard-with-charts-.jpg"
                alt="Oracle Cloud Dashboard"    
                className="w-full h-auto rounded-2xl shadow-2xl border border-border"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg animate-bounce z-20">
              <p className="text-sm font-semibold">Tiết kiệm 40% chi phí</p>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-4 rounded-xl shadow-lg animate-bounce z-20">
              <p className="text-sm font-semibold">Triển khai trong 24h</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
