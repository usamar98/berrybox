export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  featured?: boolean;
  features: string[];
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "0 SOL",
    description: "Explore templates and prototype with static mock projects.",
    features: [
      "25 AI generations",
      "1 published game",
      "Public projects",
      "Basic asset generation preview",
      "Personal usage",
    ],
  },
  {
    name: "Starter",
    price: "12 SOL",
    description: "For solo builders validating playable ideas faster.",
    features: [
      "300 AI generations",
      "5 published games",
      "Private projects",
      "Asset generation queue",
      "Commercial usage",
    ],
  },
  {
    name: "Creator",
    price: "29 SOL",
    description: "For creators shipping polished game prototypes weekly.",
    featured: true,
    features: [
      "1,500 AI generations",
      "Unlimited published games",
      "Private projects",
      "Advanced asset generation",
      "Commercial usage",
    ],
  },
  {
    name: "Pro",
    price: "79 SOL",
    description: "For studios planning collaborative pipelines and exports.",
    features: [
      "8,000 AI generations",
      "Team publishing",
      "Private projects",
      "Priority asset generation",
      "Commercial usage",
    ],
  },
];
