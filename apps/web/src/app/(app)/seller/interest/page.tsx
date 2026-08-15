import type { Metadata } from "next";

import { SellerInterest } from "@/components/seller/seller-interest";

export const metadata: Metadata = { title: "Interested buyers" };

export default function SellerInterestPage() {
  return <SellerInterest />;
}
