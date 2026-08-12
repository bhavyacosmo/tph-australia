import { TrustLinkWizard } from "@/components/trustlink/trustlink-wizard";

/**
 * The Trust Link request flow — S22-1/2/3 plus S23.
 *
 * Client's own description of the flow (transcript L365-409):
 *   select service → select professional → send request → professional
 *   authorises → connection activated.
 *
 * FR-07-02  purpose from a controlled list
 * FR-07-03  what is shared, item by item
 * FR-07-04  every optional item starts OFF
 * FR-07-05  the contact channel
 * FR-07-06  the permission period
 * FR-07-07  full plain-language disclosure before anything is sent — the single
 *           most important screen in the product
 */
export default async function TrustLinkNewPage({
  searchParams,
}: PageProps<"/trustlink/new">) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  return (
    <TrustLinkWizard
      initialService={first(params.service)}
      initialProfessional={first(params.professional)}
      initialProperty={first(params.property)}
    />
  );
}
