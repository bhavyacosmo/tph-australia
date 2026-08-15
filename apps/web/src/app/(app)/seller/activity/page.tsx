import type { Metadata } from "next";

import { SellerActivity } from "@/components/seller/seller-activity";

export const metadata: Metadata = { title: "Property activity" };

export default function SellerActivityPage() {
  return <SellerActivity />;
}
