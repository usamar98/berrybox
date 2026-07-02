import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Preview static BerryBox pricing cards for Free, Starter, Creator, and Pro plans.",
};

export default function Page() {
  return <PricingPage />;
}

