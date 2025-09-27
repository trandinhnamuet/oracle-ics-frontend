"use client"

import { Cloud, Mail, Phone, MapPin, Building2, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <AnimatedSection>
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <Cloud className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Đối tác chính thức của Oracle tại Việt Nam, sẵn sàng hỗ trợ bạn 24/7
            </p>
          </div>
        </div>
        </div>
      </AnimatedSection>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-[1400px] mx-auto">
          {/* All Cards in same row */}
          <div className="grid xl:grid-cols-3 grid-cols-1 gap-8">
            {/* Company Info */}
            <AnimatedSection delay={0.1}>
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">Thông tin công ty</CardTitle>
                      <p className="text-sm text-gray-600">CÔNG TY CỔ PHẦN AN NINH MẠNG QUỐC TẾ - ICS</p>
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 mt-1 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Văn phòng Hà Nội</p>
                      <p className="text-gray-700">TT3-5 Khu đô thị Đại Kim mới, Định Công, Hà Nội</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </AnimatedSection>

            {/* Contact Info */}
            <AnimatedSection delay={0.2}>
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-xl">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Thông tin liên hệ</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Điện thoại & Hotline</p>
                      <p className="text-gray-700">0707.806.860</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Email</p>
                      <p className="text-gray-700">info@icss.com.vn</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Website</p>
                      <p className="text-gray-700">www.icss.com.vn</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </AnimatedSection>

            {/* Google Map */}
            <AnimatedSection delay={0.3}>
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-3 rounded-xl">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Vị trí trên bản đồ</CardTitle>
                </div>
                <p className="text-sm text-gray-600">Tìm đường đến văn phòng của chúng tôi</p>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.393073964479!2d105.813893!3d20.9801586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad001d0b43d3%3A0xaf34a145d9051cd8!2sICS!5e0!3m2!1svi!2s!4v1694339200000!5m2!1svi!2s"
                    width="100%"
                    height="350"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="ICS Google Map"
                    className="w-full"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
