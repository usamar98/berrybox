export type PlanName = "free" | "starter" | "creator" | "pro";

export type CheckoutSession = {
  id: string;
  url: string;
};

export interface PaymentProvider {
  createCheckoutSession(plan: PlanName): Promise<CheckoutSession>;
  getUserPlan(userId: string): Promise<PlanName>;
  deductCredits(userId: string, credits: number): Promise<number>;
}
