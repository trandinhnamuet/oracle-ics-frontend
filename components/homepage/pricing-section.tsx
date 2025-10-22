'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Check, Star, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight, Info, Wallet, CreditCard } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { pricingCategories, customPlan } from "@/types/pricing-plans"
import { PricingCategory } from "@/types/pricing-types"
import { formatPrice, roundMoney } from "@/lib/utils"
import CustomRegistrationForm from "./customRegistrationForm"
import useAuthStore from "@/hooks/use-auth-store"
import { useToast } from "@/hooks/use-toast"
import BalanceDisplay from "@/components/wallet/balance-display"
import { subscribeWithBalance, subscribeWithPayment } from "@/api/subscription.api"
import { getUserBalance } from "@/api/user-wallet.api"

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
  const [showTooltip, setShowTooltip] = useState(false)
  const [showPaymentMethodPopup, setShowPaymentMethodPopup] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [monthsCount, setMonthsCount] = useState(1)
  const [userBalance, setUserBalance] = useState<number>(0)
  
  // Refs for scrolling
  const mainCardsRef = useRef<HTMLDivElement>(null)
  const expandedSectionRef = useRef<HTMLDivElement>(null)
  const expandedHeaderRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Lấy tỉ giá từ localStorage
  function getExchangeRate() {
    if (typeof window !== 'undefined') {
      const rate = localStorage.getItem('usdvnd_sell');
      return rate ? Number(rate) : 26500;
    }
    return 26500;
  }

  // Fetch user balance when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchBalance = async () => {
        try {
          const response = await getUserBalance()
          setUserBalance(response.balance)
        } catch (error) {
          console.error('Error fetching balance:', error)
          setUserBalance(0)
        }
      }
      fetchBalance()
    }
  }, [isAuthenticated])

  const handleSelectPlan = (plan: any, category: string) => {
    if (!isAuthenticated) {
      toast({
        title: t('homepage.pricing.auth.loginRequired'),
        description: t('pricing.loginRequired'),
        variant: "destructive",
      })
      return
    }
    setSelectedPlan(plan)
    setSelectedCategory(category)
    setSelectedPaymentMethod('')
    setMonthsCount(1)
    setShowPaymentMethodPopup(true)
  }

  const handleCustomPlanClick = () => {
    if (!isAuthenticated) {
      toast({
        title: t('homepage.pricing.auth.loginRequired'),
        description: t('homepage.pricing.auth.loginToRegister'),
        variant: "destructive",
      })
      return
    }
    setShowCustomForm(true)
  }

  const handleConfirmPaymentMethod = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn phương thức thanh toán',
        variant: 'destructive'
      })
      return
    }

    if (selectedPaymentMethod === 'account_balance') {
      // Phương thức 1: Trừ tiền tài khoản
      try {
        const currentBalance = userBalance // Current balance in VND
        const planPriceVND = parseFloat(selectedPlan.price) * getExchangeRate()
        
        if (planPriceVND > currentBalance) {
          toast({
            title: 'Số dư không đủ',
            description: 'Số dư của bạn không đủ, hãy nạp thêm.',
            variant: 'destructive'
          })
          return
        }

        // Call API to subscribe with balance
        await subscribeWithBalance({
          cloudPackageId: selectedPlan.id,
          autoRenew: false
        })
        
        setShowPaymentMethodPopup(false)
        toast({
          title: 'Đăng ký thành công!',
          description: `Đã đăng ký gói ${selectedPlan?.name} thành công. Tiền đã được trừ từ tài khoản.`,
          variant: 'default'
        })

        // Refresh balance
        const response = await getUserBalance()
        setUserBalance(response.balance)
        
      } catch (error: any) {
        console.error('Error subscribing with balance:', error)
        toast({
          title: 'Lỗi đăng ký',
          description: error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký gói.',
          variant: 'destructive'
        })
      }
    } else if (selectedPaymentMethod === 'direct_payment') {
      // Phương thức 2: Thanh toán trực tiếp
      try {
        if (monthsCount < 1) {
          toast({
            title: 'Lỗi',
            description: 'Số tháng phải lớn hơn 0',
            variant: 'destructive'
          })
          return
        }

        // Call API to create subscription with payment
        const result = await subscribeWithPayment({
          cloudPackageId: selectedPlan.id,
          monthsCount: monthsCount,
          autoRenew: false
        })

        setShowPaymentMethodPopup(false)
        
        // Navigate to checkout page with payment info
        const params = new URLSearchParams({
          paymentId: result.payment.id,
          subscriptionId: result.subscription.id.toString(),
          amount: result.payment.amount.toString(),
          method: 'sepay_qr',
          type: 'subscription'
        })
        
        router.push(`/checkout/subscription?${params.toString()}`)
      } catch (error: any) {
        console.error('Error creating subscription payment:', error)
        toast({
          title: 'Lỗi tạo thanh toán',
          description: error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán.',
          variant: 'destructive'
        })
      }
    }
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
      // Nếu đã có category mở khác, đóng trước rồi mở cái mới
      if (expandedCategory && expandedCategory !== categoryName) {
        setIsClosing(true)
        setClosingCategory(expandedCategory)
        
        setTimeout(() => {
          setExpandedCategory(categoryName)
          setIsClosing(false)
          setClosingCategory(null)
          setIsTransitioning(false)
          
          // Scroll sau khi animation hoàn thành
          setTimeout(() => {
            if (expandedSectionRef.current) {
              const sectionRect = expandedSectionRef.current.getBoundingClientRect()
              const targetScrollTop = window.scrollY + sectionRect.bottom - window.innerHeight + 24
              const startScrollTop = window.scrollY
              const distance = targetScrollTop - startScrollTop
              const duration = 1000
              const startTime = performance.now()
              
              const animateScroll = (currentTime: number) => {
                const elapsed = currentTime - startTime
                const progress = Math.min(elapsed / duration, 1)
                const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2
                window.scrollTo(0, startScrollTop + distance * easeProgress)
                
                if (progress < 1) {
                  requestAnimationFrame(animateScroll)
                }
              }
              requestAnimationFrame(animateScroll)
            }
          }, 200)
        }, 500)
      } else {
        // Mở category mới khi chưa có gì mở
        setExpandedCategory(categoryName)
        setIsClosing(false)
        setClosingCategory(null)
        setIsTransitioning(false)
        
        setTimeout(() => {
          if (expandedSectionRef.current) {
            const sectionRect = expandedSectionRef.current.getBoundingClientRect()
            const targetScrollTop = window.scrollY + sectionRect.bottom - window.innerHeight + 24
            const startScrollTop = window.scrollY
            const distance = targetScrollTop - startScrollTop
            const duration = 1000
            const startTime = performance.now()
            
            const animateScroll = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2
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
  }

  return (
    <section id="pricing" className="py-10 lg:py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance text-foreground">
            {t('homepage.pricing.subtitle')}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            {t('homepage.pricing.description')}
          </p>
        </div>

        {/* Main pricing cards */}
        <div ref={mainCardsRef} className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
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
                  <CardDescription className="text-base mt-2">{t(category.description)}</CardDescription>
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
                        {t('homepage.pricing.buttons.packages')}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        {t('homepage.pricing.buttons.viewDetails')}
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
              <CardDescription className="text-base mt-2">{t(customPlan.description)}</CardDescription>
            </CardHeader>

            <CardFooter className="pt-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full py-3"
                onClick={() => setShowCustomForm(true)}
              >
                {t('homepage.pricing.buttons.contactConsult')}
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
                  {/* Icon mini i với tooltip */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <span
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary mr-2 cursor-pointer"
                      style={{ fontSize: 12 }}
                    >
                      <Info className="w-3 h-3" />
                    </span>
                    {showTooltip && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '110%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#fff',
                          color: '#222',
                          border: '1px solid #eee',
                          borderRadius: 6,
                          padding: '8px 12px',
                          fontSize: 13,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          zIndex: 10,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t('homepage.pricing.tooltips.exchangeRate')}<br />{t('homepage.pricing.tooltips.todayRate')} <b>{getExchangeRate().toLocaleString()}</b>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {t(`homepage.pricing.plans.${expandedCategory || closingCategory}`)}
                  </Badge>
                  <span className={`text-muted-foreground transition-all duration-400 ${
                    isClosing 
                      ? 'animate-out fade-out-0 slide-out-to-right-2 duration-400 delay-100'
                      : 'animate-in fade-in-0 slide-in-from-right-2 duration-300 delay-100'
                  }`}>
                    {t('homepage.pricing.sections.selectSuitable')}
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
                  {t('homepage.pricing.buttons.close')}
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
                  className={`flex overflow-x-auto gap-4 pb-2 pt-2 hide-scrollbar${
                    (pricingCategories.find(cat => cat.name === (expandedCategory || closingCategory))?.plans.length ?? 0) <= 6 ? ' justify-center' : ''
                  }`}
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
                              {/* Hiển thị giá VND, debug giá gốc và tỉ giá */}
                              {(() => {
                                const usdPrice = parseFloat(plan.price);
                                const exchangeRate = getExchangeRate();
                                const vndPrice = Math.floor(usdPrice * exchangeRate);
                                const roundedVnd = roundMoney(vndPrice);
                                console.log(`Plan ${plan.name}: USD=${usdPrice}, Rate=${exchangeRate}, VND gốc=${vndPrice}, VND làm tròn=${roundedVnd}`);
                                return formatPrice(roundedVnd);
                              })()}
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
                              +{plan.features.length - 4} {t('homepage.pricing.sections.moreFeatures')}
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
                            {t('homepage.pricing.buttons.selectPlan')}
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
          <p className="text-muted-foreground">{t('homepage.pricing.additionalInfo.support247')}</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ {t('homepage.pricing.additionalInfo.noSetupFee')}</span>
            <span>✓ {t('homepage.pricing.additionalInfo.cancelAnytime')}</span>
            <span>✓ {t('homepage.pricing.additionalInfo.flexiblePayment')}</span>
            <span>✓ {t('homepage.pricing.additionalInfo.freeConsult')}</span>
          </div>
          <div className="pt-4">
            <span className="inline-block px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-lg tracking-wide">
              {t('homepage.pricing.additionalInfo.hotlineSupport')} <a href="tel:0707806860" className="underline hover:text-primary/80">0707 806 860</a>
            </span>
          </div>
        </div>
      </div>

      {/* Custom Registration Form Popup */}
      <CustomRegistrationForm 
        open={showCustomForm} 
        onOpenChange={setShowCustomForm} 
      />

      {/* Payment Method Selection Popup */}
      <Dialog open={showPaymentMethodPopup} onOpenChange={setShowPaymentMethodPopup}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Chọn phương thức thanh toán
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Chọn cách thức thanh toán phù hợp cho gói {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-4 my-6">
            {/* Phương thức 1: Trừ tiền tài khoản */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPaymentMethod === 'account_balance' 
                  ? 'border-[#E60000] border-2 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPaymentMethod('account_balance')}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-3 p-3 rounded-2xl w-fit ${
                  selectedPaymentMethod === 'account_balance' 
                    ? 'bg-[#E60000] text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Wallet className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg">Trừ tiền tài khoản</CardTitle>
                <CardDescription className="text-sm">
                  Sử dụng số dư có sẵn trong tài khoản để thanh toán
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Số dư hiện tại</div>
                  <div className="text-lg font-bold text-[#E60000]">{formatPrice(userBalance)} đ</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 mb-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/add-funds')
                    }}
                  >
                    Nạp tiền
                  </Button>
                  <div className="text-sm text-muted-foreground mt-2">
                    ✓ Thanh toán ngay lập tức<br/>
                    ✓ Không phí giao dịch
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phương thức 2: Thanh toán trực tiếp */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPaymentMethod === 'direct_payment' 
                  ? 'border-[#E60000] border-2 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPaymentMethod('direct_payment')}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-3 p-3 rounded-2xl w-fit ${
                  selectedPaymentMethod === 'direct_payment' 
                    ? 'bg-[#E60000] text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <CreditCard className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg">Thanh toán trực tiếp</CardTitle>
                <CardDescription className="text-sm">
                  Thanh toán qua chuyển khoản ngân hàng hoặc QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Số tháng đăng ký
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      value={monthsCount}
                      onChange={(e) => setMonthsCount(parseInt(e.target.value) || 1)}
                      className="text-center font-semibold"
                      disabled={selectedPaymentMethod !== 'direct_payment'}
                    />
                  </div>
                  {selectedPaymentMethod === 'direct_payment' && selectedPlan && (
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Tổng thanh toán</div>
                      <div className="text-lg font-bold text-[#E60000]">
                        {(() => {
                          const usdPrice = parseFloat(selectedPlan.price) * monthsCount
                          const exchangeRate = getExchangeRate()
                          const vndPrice = Math.floor(usdPrice * exchangeRate)
                          const roundedVnd = roundMoney(vndPrice)
                          return formatPrice(roundedVnd)
                        })()} VND
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(roundMoney(parseFloat(selectedPlan.price) * getExchangeRate()))} × {monthsCount} tháng
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentMethodPopup(false)}
            >
              Đóng
            </Button>
            <Button 
              className="bg-[#E60000] hover:bg-red-700"
              onClick={handleConfirmPaymentMethod}
              disabled={!selectedPaymentMethod}
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
