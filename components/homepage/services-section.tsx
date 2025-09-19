'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Shield, Zap, Globe, BarChart3, Cpu, HardDrive, Network, Lock, CloudCog } from "lucide-react"
import { useTranslation } from "react-i18next"

const services = [
  {
    icon: Database,
    title: "Oracle Database Cloud",
    description: "Cơ sở dữ liệu Oracle tự quản lý với hiệu suất cao và bảo mật tuyệt đối",
    features: ["Autonomous Database", "Real Application Clusters", "Data Guard", "Advanced Security"],
  },
  {
    icon: Cpu,
    title: "Compute Cloud",
    description: "Máy chủ ảo linh hoạt với cấu hình tùy chỉnh theo nhu cầu doanh nghiệp",
    features: ["Bare Metal", "Virtual Machines", "Container Engine", "Functions"],
  },
  {
    icon: HardDrive,
    title: "Storage Solutions",
    description: "Giải pháp lưu trữ đa dạng từ block storage đến object storage",
    features: ["Block Volume", "Object Storage", "File Storage", "Archive Storage"],
  },
  {
    icon: Network,
    title: "Networking",
    description: "Hạ tầng mạng toàn cầu với độ trễ thấp và băng thông cao",
    features: ["Virtual Cloud Network", "Load Balancer", "VPN Connect", "FastConnect"],
  },
  {
    icon: Shield,
    title: "Security & Identity",
    description: "Bảo mật đa lớp với quản lý danh tính và truy cập tiên tiến",
    features: ["Identity Management", "Key Management", "Web Application Firewall", "Security Zones"],
  },
  {
    icon: BarChart3,
    title: "Analytics & AI",
    description: "Phân tích dữ liệu thông minh với machine learning tích hợp",
    features: ["Analytics Cloud", "Data Science", "Machine Learning", "Big Data Service"],
  },
]

export function ServicesSection() {
  const { t } = useTranslation()

  return (
    <section id="services" className="py-10 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance text-foreground">
            {t('homepage.services.subtitle')}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Từ cơ sở dữ liệu đến AI, chúng tôi cung cấp đầy đủ các dịch vụ cloud để đáp ứng mọi nhu cầu chuyển đổi số
            của doanh nghiệp.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 bg-gradient-to-br from-card to-background"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors text-foreground">
                        {service.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {service.description}
                  </CardDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Tính năng chính:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Triển khai nhanh</h3>
            <p className="text-sm text-muted-foreground">Khởi tạo trong vài phút</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mx-auto mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Phủ sóng toàn cầu</h3>
            <p className="text-sm text-muted-foreground">36+ data centers</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mx-auto mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Bảo mật enterprise</h3>
            <p className="text-sm text-muted-foreground">Tuân thủ quốc tế</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Tối ưu chi phí</h3>
            <p className="text-sm text-muted-foreground">Tiết kiệm đến 40%</p>
          </div>
        </div>
      </div>
    </section>
  )
}
