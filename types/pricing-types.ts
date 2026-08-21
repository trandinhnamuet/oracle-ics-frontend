import { LucideIcon } from "lucide-react"

export interface PricingPlan {
  id: number
  name: string
  description: string
  price: string
  priceVnd: number
  period: string
  icon: LucideIcon
  popular: boolean
  features: string[]
  limitations: string[]
  category: 'starter' | 'professional' | 'enterprise' | 'custom' | 'ai'
  subPlanNumber?: number
  /** vCPU count (from the package), used to estimate the Windows license uplift. */
  vcpu?: number
}

export interface PricingCategory {
  name: string
  basePrice: string
  icon: LucideIcon
  popular: boolean
  description: string
  plans: PricingPlan[]
}