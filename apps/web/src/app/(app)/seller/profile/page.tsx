import type { Metadata } from "next";

import { SellerProfile } from "@/components/seller/seller-profile";

export const metadata: Metadata = { title: "Seller profile" };

export default function SellerProfilePage() {
  return <SellerProfile />;
}
