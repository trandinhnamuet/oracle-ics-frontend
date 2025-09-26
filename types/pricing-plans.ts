import { LucideIcon, Zap, Shield, Crown, Star, BrainCircuit } from "lucide-react"
import { PricingPlan, PricingCategory } from "./pricing-types"
import { starterPlans } from "./plan-starter"
import { professionalPlans } from "./plan-professional"
import { enterprisePlans } from "./plan-enterprise"
import { aiPlans } from "./plan-ai"

// Custom Plan
export const customPlan: PricingPlan = {
  id: 0,
  name: "custom",
  description: "Giải pháp tuỳ chỉnh theo yêu cầu doanh nghiệp",
  price: "Liên hệ",
  period: "",
  icon: Star,
  popular: false,
  category: 'custom',
  features: [
    "Cấu hình linh hoạt",
    "Tích hợp hệ thống riêng",
    "Tư vấn kiến trúc chuyên sâu",
    "Hỗ trợ triển khai tận nơi"
  ],
  limitations: [],
}

// Main pricing categories for display
export const pricingCategories: PricingCategory[] = [
  {
    name: "starter",
    basePrice: starterPlans[0].price,
    icon: Zap,
    popular: false,
    description: "Phù hợp cho doanh nghiệp nhỏ",
    plans: starterPlans
  },
  {
    name: "professional", 
    basePrice: professionalPlans[0].price,
    icon: Shield,
    popular: true,
    description: "Lựa chọn phổ biến cho doanh nghiệp vừa",
    plans: professionalPlans
  },
  {
    name: "enterprise",
    basePrice: enterprisePlans[0].price,
    icon: Crown,
    popular: false,
    description: "Giải pháp toàn diện cho doanh nghiệp lớn",
    plans: enterprisePlans
  },
  {
    name: "ai",
    basePrice: aiPlans[0].price,
    icon: BrainCircuit,
    popular: false,
    description: "Hạ tầng AI - Triển khai model LLM của bạn trên cloud.",
    plans: aiPlans
  }
]

// All plans combined
export const allPlans: PricingPlan[] = [
  ...starterPlans,
  ...professionalPlans,
  ...enterprisePlans,
  ...aiPlans,
  customPlan
]
