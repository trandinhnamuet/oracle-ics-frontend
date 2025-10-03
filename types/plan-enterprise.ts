import { PricingPlan } from "./pricing-types";
import { Crown } from "lucide-react";

export const enterprisePlans: PricingPlan[] = [
  {
    id: 1,
    name: "Enterprise 1",
    description: "pricing.plans.enterprise.1.description",
    price: "121.48",
    period: "tháng",
    icon: Crown,
    popular: true,
    category: 'enterprise',
    subPlanNumber: 1,
    features: [
      "10 vCPU",
      "16GB RAM",
      "250GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 2,
    name: "Enterprise 2",
    description: "pricing.plans.enterprise.2.description",
    price: "140.08",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'enterprise',
    subPlanNumber: 2,
    features: [
      "12 vCPU",
      "16GB RAM",
      "250GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 3,
    name: "Enterprise 3",
    description: "pricing.plans.enterprise.3.description",
    price: "152.94",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'enterprise',
    subPlanNumber: 3,
    features: [
      "12 vCPU",
      "18GB RAM",
      "500GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 4,
    name: "Enterprise 4",
    description: "pricing.plans.enterprise.4.description",
    price: "205.76",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'enterprise',
    subPlanNumber: 4,
    features: [
      "16 vCPU",
      "32GB RAM",
      "500GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 5,
    name: "Enterprise 5",
    description: "pricing.plans.enterprise.5.description",
    price: "228.03",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'enterprise',
    subPlanNumber: 5,
    features: [
      "16 vCPU",
      "32GB RAM",
      "1024GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 6,
    name: "Enterprise 6",
    description: "pricing.plans.enterprise.6.description",
    price: "302.43",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'enterprise',
    subPlanNumber: 6,
    features: [
      "24 vCPU",
      "32GB RAM",
      "1024GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 7,
    name: "Enterprise 7",
    description: "pricing.plans.enterprise.7.description",
    price: "326.24",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'enterprise',
    subPlanNumber: 7,
    features: [
      "36 vCPU",
      "64GB RAM",
      "1024GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 8,
    name: "Enterprise 8",
    description: "pricing.plans.enterprise.8.description",
    price: "483.97",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'enterprise',
    subPlanNumber: 8,
    features: [
      "48 vCPU",
      "128GB RAM",
      "1024GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  },
  {
    id: 9,
    name: "Tư vấn toàn diện",
    description: "pricing.plans.enterprise.9.description",
    price: "0.16",
    period: "tháng",
    icon: Crown,
    popular: false,
    category: 'starter',
    subPlanNumber: 6,
    features: [
      "0 vCPU",
      "0 RAM",
      "0GB SSD Storage",
      "Băng thông 300Mbps"
    ],
    limitations: [],
  }
];
