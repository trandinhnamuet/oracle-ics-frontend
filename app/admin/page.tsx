'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText } from 'lucide-react'

const adminLinks = [
  {
    title: 'Quản lý người dùng',
    description: 'Xem, chỉnh sửa và quản lý tài khoản người dùng',
    href: '/admin/users',
    icon: Users,
    color: 'bg-blue-500',
    stats: 'Tổng 24 người dùng'
  },
  {
    title: 'Đăng ký gói tùy chỉnh',
    description: 'Quản lý các yêu cầu đăng ký gói dịch vụ tùy chỉnh',
    href: '/admin/custom-registration',
    icon: FileText,
    color: 'bg-green-500',
    stats: '5 yêu cầu mới'
  }
]

export default function AdminDashboard() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 min-h-screen">
      {/* Admin Links */}
      <div className={`space-y-4 transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`}>
        <h2 className="text-2xl font-semibold">Quản lý hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminLinks.map((link, index) => (
            <Card 
              key={index} 
              className={`hover:shadow-lg transition-all duration-700 transform ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
              }`}
              style={{ 
                transitionDelay: `${index * 200}ms` 
              }}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${link.color}`}>
                    <link.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {link.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{link.stats}</span>
                  <Link href={link.href}>
                    <Button variant="outline" size="sm">
                      Truy cập
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
