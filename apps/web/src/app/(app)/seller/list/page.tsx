import type { Metadata } from "next";

import { ListingForm } from "@/components/seller/listing-form";

export const metadata: Metadata = { title: "List a property" };

export default function ListPropertyPage() {
  return <ListingForm />;
}
