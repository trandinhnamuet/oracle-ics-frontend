'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Cloud, CreditCard, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export default function WalletSidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = [
    {
      icon: Cloud,
      label: 'Cloud của tôi',
      href: '/package-management',
      description: 'Quản lý gói đã mua'
    },
    {
      icon: CreditCard,
      label: 'Quản lý thanh toán',
      href: '/checkout/history',
      description: 'Xem lịch sử giao dịch'
    }
  ]

  const isActive = (href: string) => {
    return pathname === href
  }

  const handleNavigate = (href: string) => {
    router.push(href)
    setMobileOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Tài khoản của tôi</h2>
        <p className="text-sm text-gray-500 mt-1">Quản lý cloud và thanh toán</p>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigate(item.href)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group ${
                active
                  ? 'bg-gray-100 border-l-4 border-gray-900'
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors ${
                  active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <div className="flex-1">
                  <p className={`font-medium text-sm transition-colors ${
                    active ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {item.label}
                  </p>
                  <p className={`text-xs transition-colors ${
                    active ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Info section */}
      <div className="p-4 bg-gradient-to-t from-gray-50 to-transparent border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">
            <span className="font-medium text-gray-900">Cần giúp?</span><br />
            Liên hệ support
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Header with Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-40">
        <h2 className="font-bold text-gray-900">Tài khoản</h2>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-gray-900" />
          ) : (
            <Menu className="w-5 h-5 text-gray-900" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-16">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
