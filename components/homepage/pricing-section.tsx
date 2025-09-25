'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { pricingCategories, customPlan } from "@/types/pricing-plans"
import { PricingCategory } from "@/types/pricing-types"
import { formatPrice } from "@/lib/utils"
import CustomRegistrationForm from "./customRegistrationForm"
import useAuthStore from "@/hooks/use-auth-store"
import { useToast } from "@/hooks/use-toast"

export function PricingSection() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const [expandedCategory, setExpandedCategory] = useState<string | null>('starter')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [closingCategory, setClosingCategory] = useState<string | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  
  // Refs for scrolling
  const mainCardsRef = useRef<HTMLDivElement>(null)
  const expandedSectionRef = useRef<HTMLDivElement>(null)
  const expandedHeaderRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleSelectPlan = (plan: any, category: string) => {
    const params = new URLSearchParams({
      planId: plan.id,
      name: plan.name,
      price: plan.price,
      description: plan.description,
      category: category,
      period: plan.period || '',
      features: JSON.stringify(plan.features)
    })
    
    router.push(`/checkout?${params.toString()}`)
  }

  const handleCustomPlanClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Xin hãy đăng nhập để đăng ký gói tùy chọn",
        variant: "destructive",
      })
      return
    }
    setShowCustomForm(true)
  }

      // Function để handle scroll khi đóng từ button "Đóng"
  const handleCloseWithScroll = () => {
    const currentCategory = expandedCategory || closingCategory
    if (currentCategory) {
      // Trigger animation đóng ngay lập tức
      setIsClosing(true)
      setClosingCategory(currentCategory)
      
      // Đóng sau khi animation hoàn thành
      setTimeout(() => {
        setExpandedCategory(null)
        setTimeout(() => {
          setIsClosing(false)
          setClosingCategory(null)
        }, 500)
      }, 1000)
    }
  }

  const handleToggleExpanded = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      // Trigger animation đóng ngay lập tức
      setIsClosing(true)
      setClosingCategory(categoryName)
      
      setTimeout(() => {
        setExpandedCategory(null)
        setTimeout(() => {
          setIsClosing(false)
          setClosingCategory(null)
        }, 500)
      }, 1000)
    } else {
      setExpandedCategory(categoryName)
      setIsClosing(false)
      setClosingCategory(null)
      setIsTransitioning(false)
      // Scroll để carousel các gói con căn cạnh dưới màn hình
      setTimeout(() => {
        if (expandedSectionRef.current) {
          const sectionRect = expandedSectionRef.current.getBoundingClientRect()
          const targetScrollTop = window.scrollY + sectionRect.bottom - window.innerHeight + 24
          // Scroll chậm hơn với duration 1000ms
          const startScrollTop = window.scrollY
          const distance = targetScrollTop - startScrollTop
          const duration = 1000
          const startTime = performance.now()
          
          const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2 // easeInOutSine
            window.scrollTo(0, startScrollTop + distance * easeProgress)
            
            if (progress < 1) {
              requestAnimationFrame(animateScroll)
            }
          }
          requestAnimationFrame(animateScroll)
        }
      }, 200)
    }
  }

  return (
    <section id="pricing" className="py-10 lg:py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance text-foreground">
            {t('homepage.pricing.subtitle')}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Các gói dịch vụ Oracle Cloud linh hoạt, có thể mở rộng theo nhu cầu với mức giá cạnh tranh nhất thị trường
            Việt Nam.
          </p>
        </div>

        {/* Main pricing cards */}
        <div ref={mainCardsRef} className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingCategories.map((category: PricingCategory, index: number) => {
            const IconComponent = category.icon
            return (
              <Card
                key={index}
                className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                  expandedCategory === category.name
                    ? "border-primary border-3 shadow-lg bg-gradient-to-b from-background to-card"
                    : "hover:border-primary/50"
                } h-auto`}
                onClick={() => handleToggleExpanded(category.name)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 p-3 bg-primary/10 rounded-2xl w-fit">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">{t(`homepage.pricing.plans.${category.name}`)}</CardTitle>
                  <CardDescription className="text-base mt-2">{category.description}</CardDescription>
                </CardHeader>

                <CardFooter className="pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-primary hover:text-primary/80 transition-all duration-200 hover:bg-primary/5 py-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleExpanded(category.name)
                    }}
                  >
                    {expandedCategory === category.name ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Ẩn {category.plans.length} gói
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Xem {category.plans.length} gói chi tiết
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}

          {/* Custom Plan */}
          <Card className="relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 h-auto">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 p-3 bg-primary/10 rounded-2xl w-fit">
                <customPlan.icon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">{t(`homepage.pricing.plans.${customPlan.name}`)}</CardTitle>
              <CardDescription className="text-base mt-2">{customPlan.description}</CardDescription>
            </CardHeader>

            <CardFooter className="pt-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full py-3"
                onClick={handleCustomPlanClick}
              >
                Liên hệ tư vấn
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Expanded Plans Section */}
        <div 
          ref={expandedSectionRef}
          className={`mt-12 transition-all duration-700 ease-in-out ${
          expandedCategory 
            ? 'opacity-100 translate-y-0 max-h-[2000px]' 
            : 'opacity-0 translate-y-4 max-h-0 overflow-hidden'
        }`}>
          {/* Loading transition indicator */}
          {isTransitioning && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {(expandedCategory || isClosing) && !isTransitioning && (
            <div className="animate-in slide-in-from-top-4 duration-500">
              <div ref={expandedHeaderRef} className={`flex items-center justify-between mb-6 transition-all duration-400 ${
                isClosing 
                  ? 'animate-out fade-out-0 slide-out-to-top-2 duration-400'
                  : 'animate-in fade-in-0 slide-in-from-top-2 duration-300'
              }`}>
                <div className={`flex items-center space-x-3 transition-all duration-400 ${
                  isClosing 
                    ? 'animate-out fade-out-0 slide-out-to-left-2 duration-400'
                    : 'animate-in fade-in-0 slide-in-from-left-2 duration-300'
                }`}>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {t(`homepage.pricing.plans.${expandedCategory || closingCategory}`)}
                  </Badge>
                  <span className={`text-muted-foreground transition-all duration-400 ${
                    isClosing 
                      ? 'animate-out fade-out-0 slide-out-to-right-2 duration-400 delay-100'
                      : 'animate-in fade-in-0 slide-in-from-right-2 duration-300 delay-100'
                  }`}>
                    Chọn gói phù hợp nhất cho bạn
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseWithScroll}
                  className={`hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 ${
                    isClosing 
                      ? 'animate-out fade-out-0 scale-out-95 duration-400 delay-200'
                      : 'animate-in fade-in-0 scale-in-95 duration-300 delay-200'
                  }`}
                >
                  <X className="h-4 w-4 mr-1" />
                  Đóng
                </Button>
              </div>
              
              <div className="relative">
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card border rounded-full p-2 shadow hover:bg-primary/10"
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' })
                    }
                  }}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto gap-4 pb-2 pt-2 hide-scrollbar"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {pricingCategories
                    .find(cat => cat.name === (expandedCategory || closingCategory))
                    ?.plans.map((plan, planIndex) => (
                      <Card
                        key={plan.id}
                        className={`min-w-[220px] max-w-[220px] flex-shrink-0 scroll-snap-align-start transition-all duration-500 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 mt-2 ${
                          isClosing 
                            ? 'animate-out fade-out-0 slide-out-to-bottom-4 duration-700'
                            : 'animate-in fade-in-0 slide-in-from-bottom-4 duration-700'
                        }`}
                        style={{
                          animationDelay: isClosing
                            ? `${planIndex * 80}ms`
                            : `${planIndex * 100}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              #{plan.subPlanNumber}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(plan.price)}
                            </div>
                            <div className="text-xs text-muted-foreground">₫/{plan.period}</div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-2">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <Check className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                              <span className="text-xs text-foreground leading-relaxed">{feature}</span>
                            </div>
                          ))}
                          {plan.features.length > 4 && (
                            <div className="text-xs text-muted-foreground">
                              +{plan.features.length - 4} tính năng khác
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="pt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                            onClick={() => handleSelectPlan(plan, expandedCategory || closingCategory || '')}
                          >
                            Chọn gói này
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  }
                </div>
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card border rounded-full p-2 shadow hover:bg-primary/10"
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' })
                    }
                  }}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-muted-foreground">Tất cả gói đều bao gồm hỗ trợ kỹ thuật 24/7 và đảm bảo uptime 99.9%</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ Không phí setup</span>
            <span>✓ Hủy bất cứ lúc nào</span>
            <span>✓ Thanh toán linh hoạt</span>
            <span>✓ Tư vấn miễn phí</span>
          </div>
          <div className="pt-4">
            <span className="inline-block px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-lg tracking-wide">
              Hotline hỗ trợ: <a href="tel:0707806860" className="underline hover:text-primary/80">0707 806 860</a>
            </span>
          </div>
        </div>
      </div>

      {/* Custom Registration Form Popup */}
      <CustomRegistrationForm 
        open={showCustomForm} 
        onOpenChange={setShowCustomForm} 
      />
    </section>
  )
}
