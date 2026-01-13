'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function CheckoutSuccessPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscriptionId')
  const [showAnimation, setShowAnimation] = useState(false)
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Trigger animations in sequence
    const timer1 = setTimeout(() => {
      setShowAnimation(true)
    }, 300)

    const timer2 = setTimeout(() => {
      setShowCheckmark(true)
    }, 1800)

    const timer3 = setTimeout(() => {
      setShowContent(true)
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Success Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="relative">
            {/* Circular border that animates */}
            <div className="relative w-24 h-24">
              <svg
                className="w-24 h-24 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                {/* Animated progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={showAnimation ? "0" : "283"}
                  className="duration-2000 ease-out transition-all"
                />
              </svg>
              
              {/* Check icon with scale animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle 
                  className={`w-16 h-16 text-green-500 transition-all duration-700 ease-out ${
                    showCheckmark 
                      ? 'scale-100 opacity-100' 
                      : 'scale-0 opacity-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Message with staggered animation */}
        <div className={`transition-all duration-1000 ease-out ${
          showContent 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0'
        }`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('checkout.success.title')}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t('checkout.success.desc')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col gap-4 transition-all duration-1000 ease-out delay-300 ${
          showContent 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0'
        }`}>
          <Link href={subscriptionId ? `/cloud/configuration/${subscriptionId}` : '/cloud/configuration'} className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-200 hover:scale-[1.02]">
              {t('checkout.success.configBtn')}
            </Button>
          </Link>
          <Link href="/package-management" className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-200 hover:scale-[1.02]">
              {t('checkout.success.manageBtn')}
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full py-3 transition-all duration-200 hover:scale-[1.02]">
              {t('checkout.success.homeBtn')}
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className={`mt-8 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-green-200 transition-all duration-1000 ease-out delay-500 ${
          showContent 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0'
        }`}>
          <p className="text-sm text-gray-600">
            <strong>{t('checkout.success.note').split(':')[0]}:</strong> {t('checkout.success.note').split(':').slice(1).join(':').trim()}
          </p>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-green-400 rounded-full opacity-30 transition-all duration-3000 ease-out ${
                showCheckmark ? 'animate-bounce' : ''
              }`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 20}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}