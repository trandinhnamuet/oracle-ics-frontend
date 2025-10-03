import { PricingPlan } from "./pricing-types";
import { BrainCircuit } from "lucide-react";

export const aiPlans: PricingPlan[] = [
  {
    id: 1,
    name: "VM.GPU2.1",
    description: "pricing.plans.ai.1.description",
    price: "992.12",
    period: "tháng",
    icon: BrainCircuit,
    popular: false,
    category: 'ai',
    subPlanNumber: 1,
    features: [
      "1 GPU Tesla P100",
      "16GB RAM",
      "1024GB SSD Storage",
      "Hạ tầng AI chuyên dụng"
    ],
    limitations: [],
  },
  {
    id: 2,
    name: "VM.GPU.A10.1",
    description: "pricing.plans.ai.2.description",
    price: "1531.52",
    period: "tháng",
    icon: BrainCircuit,
    popular: false,
    category: 'ai',
    subPlanNumber: 2,
    features: [
      "1 GPU A10 Tensor Core",
      "24GB RAM",
      "1024GB SSD Storage",
      "Hạ tầng AI chuyên dụng"
    ],
    limitations: [],
  },
  {
    id: 3,
    name: "BM.GPU2.2",
    description: "pricing.plans.ai.3.description",
    price: "1940.72",
    period: "tháng",
    icon: BrainCircuit,
    popular: false,
    category: 'ai',
    subPlanNumber: 3,
    features: [
      "2 GPU Tesla P100",
      "32GB RAM",
      "1024GB SSD Storage",
      "Hạ tầng AI chuyên dụng"
    ],
    limitations: [],
  },
  {
    id: 4,
    name: "VM.GPU.A10.2",
    description: "pricing.plans.ai.4.description",
    price: "2980.25",
    period: "tháng",
    icon: BrainCircuit,
    popular: false,
    category: 'ai',
    subPlanNumber: 4,
    features: [
      "2 GPU A10 Tensor Core",
      "48GB RAM",
      "1024GB SSD Storage",
      "Hạ tầng AI chuyên dụng"
    ],
    limitations: [],
  }
];
