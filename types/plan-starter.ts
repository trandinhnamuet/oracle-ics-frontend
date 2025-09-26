import { PricingPlan } from "./pricing-types";
import { Zap } from "lucide-react";

export const starterPlans: PricingPlan[] = [
  {
    id: 1,
    name: "Starter 1",
    description: "2 vCPU, 1GB RAM, 20GB SSD Storage",
    price: "12.75",
    period: "tháng",
    icon: Zap,
    popular: true,
    category: 'starter',
    subPlanNumber: 1,
    features: [
      "2 vCPU",
      "1GB RAM",
      "20GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 2,
    name: "Starter 2",
    description: "2 vCPU, 2GB RAM, 40GB SSD Storage",
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
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 3,
    name: "Starter 3",
    description: "4 vCPU, 4GB RAM, 80GB SSD Storage",
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
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 4,
    name: "Starter 4",
    description: "4 vCPU, 8GB RAM, 80GB SSD Storage",
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
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 5,
    name: "Starter 5",
    description: "8 vCPU, 8GB RAM, 100GB SSD Storage",
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
      "Băng thông 300Mbps"
    ],
    limitations: [],
  }
];
