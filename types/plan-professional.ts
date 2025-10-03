import { PricingPlan } from "./pricing-types";
import { Shield } from "lucide-react";

export const professionalPlans: PricingPlan[] = [
  {
    id: 1,
    name: "Professional 1",
    description: "pricing.plans.professional.1.description",
    price: "48.15",
    period: "tháng",
    icon: Shield,
    popular: true,
    category: 'professional',
    subPlanNumber: 1,
    features: [
      "4 vCPU",
      "6GB RAM",
      "100GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 2,
    name: "Professional 2",
    description: "pricing.plans.professional.2.description",
    price: "71.10",
    period: "tháng",
    icon: Shield,
    popular: false,
    category: 'professional',
    subPlanNumber: 2,
    features: [
      "6 vCPU",
      "8GB RAM",
      "150GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 3,
    name: "Professional 3",
    description: "pricing.plans.professional.3.description",
    price: "89.70",
    period: "tháng",
    icon: Shield,
    popular: false,
    category: 'professional',
    subPlanNumber: 3,
    features: [
      "8 vCPU",
      "10GB RAM",
      "150GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 4,
    name: "Professional 4",
    description: "pricing.plans.professional.4.description",
    price: "94.17",
    period: "tháng",
    icon: Shield,
    popular: false,
    category: 'professional',
    subPlanNumber: 4,
    features: [
      "8 vCPU",
      "12GB RAM",
      "150GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 5,
    name: "Professional 5",
    description: "pricing.plans.professional.5.description",
    price: "100.76",
    period: "tháng",
    icon: Shield,
    popular: false,
    category: 'professional',
    subPlanNumber: 5,
    features: [
      "8 vCPU",
      "16GB RAM",
      "200GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 6,
    name: "Professional 6",
    description: "pricing.plans.professional.6.description",
    price: "118.61",
    period: "tháng",
    icon: Shield,
    popular: false,
    category: 'professional',
    subPlanNumber: 6,
    features: [
      "8 vCPU",
      "32GB RAM",
      "200GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  }
];
