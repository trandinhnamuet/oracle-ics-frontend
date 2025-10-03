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
  description: "pricing.plans.custom.description",
  price: "pricing.plans.custom.price",
  period: "",
  icon: Star,
  popular: false,
  category: 'custom',
  features: [
    "pricing.plans.custom.features.flexible",
    "pricing.plans.custom.features.integration",
    "pricing.plans.custom.features.consulting",
    "pricing.plans.custom.features.onsite"
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
    description: "pricing.categories.starter.description",
    plans: starterPlans
  },
  {
    name: "professional", 
    basePrice: professionalPlans[0].price,
    icon: Shield,
    popular: true,
    description: "pricing.categories.professional.description",
    plans: professionalPlans
  },
  {
    name: "enterprise",
    basePrice: enterprisePlans[0].price,
    icon: Crown,
    popular: false,
    description: "pricing.categories.enterprise.description",
    plans: enterprisePlans
  },
  {
    name: "ai",
    basePrice: aiPlans[0].price,
    icon: BrainCircuit,
    popular: false,
    description: "pricing.categories.ai.description",
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
