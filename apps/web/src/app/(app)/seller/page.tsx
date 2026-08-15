import type { Metadata } from "next";

import { SellerOverview } from "@/components/seller/seller-overview";

export const metadata: Metadata = { title: "Seller dashboard" };

export default function SellerPage() {
  return <SellerOverview />;
}
