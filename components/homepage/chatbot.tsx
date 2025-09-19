'use client'

import { useState } from 'react'
import { X, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Gửi tin nhắn:', message)
      setMessage('')
    }
  }

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-20 right-6 w-96 shadow-xl z-50 animate-in slide-in-from-bottom-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Tư vấn hỗ trợ</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-[300px] max-h-[400px] overflow-y-auto border rounded-md p-3 bg-muted/30">
          <div className="flex items-start space-x-2 mb-3">
            <div className="bg-primary rounded-full p-1">
              <MessageCircle className="h-3 w-3 text-white" />
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <p className="text-sm">Xin chào! Tôi có thể hỗ trợ gì cho bạn về dịch vụ Oracle Cloud?</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Nhập tin nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        size="sm"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      <Chatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
