import { LucideIcon } from "lucide-react"

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: string
  period: string
  icon: LucideIcon
  popular: boolean
  features: string[]
  limitations: string[]
  category: 'starter' | 'professional' | 'enterprise' | 'custom'
  subPlanNumber?: number
}

export interface PricingCategory {
  name: string
  basePrice: string
  icon: LucideIcon
  popular: boolean
  description: string
  plans: PricingPlan[]
}