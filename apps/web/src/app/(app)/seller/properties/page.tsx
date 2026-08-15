import type { Metadata } from "next";

import { SellerProperties } from "@/components/seller/seller-properties";

export const metadata: Metadata = { title: "My properties" };

export default function SellerPropertiesPage() {
  return <SellerProperties />;
}
