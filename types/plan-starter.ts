import { PricingPlan } from "./pricing-types";
import { Zap } from "lucide-react";

export const starterPlans: PricingPlan[] = [
  {
    id: 1,
    name: "Starter 1",
    description: "pricing.plans.starter.1.description",
    price: "1",
    period: "tháng",
    icon: Zap,
    popular: true,
    category: 'starter',
    subPlanNumber: 1,
    features: [
      "2 vCPU",
      "1GB RAM",
      "20GB SSD Storage",
      "Bandwidth 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 2,
    name: "Starter 2",
    description: "pricing.plans.starter.2.description",
    price: "15.09",
    period: "tháng",
    icon: Zap,
    popular: false,
    category: 'starter',
    subPlanNumber: 2,
    features: [
      "2 vCPU",
      "2GB RAM",
      "40GB SSD Storage",
      "Bandwidth 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 3,
    name: "Starter 3",
    description: "pricing.plans.starter.3.description",
    price: "30.18",
    period: "tháng",
    icon: Zap,
    popular: false,
    category: 'starter',
    subPlanNumber: 3,
    features: [
      "4 vCPU",
      "4GB RAM",
      "80GB SSD Storage",
      "Bandwidth 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 4,
    name: "Starter 4",
    description: "pricing.plans.starter.4.description",
    price: "36.14",
    period: "tháng",
    icon: Zap,
    popular: false,
    category: 'starter',
    subPlanNumber: 4,
    features: [
      "4 vCPU",
      "8GB RAM",
      "80GB SSD Storage",
      "Bandwidth 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 5,
    name: "Starter 5",
    description: "pricing.plans.starter.5.description",
    price: "57.82",
    period: "tháng",
    icon: Zap,
    popular: false,
    category: 'starter',
    subPlanNumber: 5,
    features: [
      "8 vCPU",
      "8GB RAM",
      "100GB SSD Storage",
      "Bandwidth 300Mbps"
    ],
    limitations: [],
  }
];
