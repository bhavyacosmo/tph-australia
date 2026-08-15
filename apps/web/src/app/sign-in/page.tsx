import { SignIn } from "@/components/auth/sign-in";

export const metadata = {
  title: "Sign in",
};

/**
 * ⚠️ MOCK sign-in for the prototype. See src/lib/mock/accounts.ts for what this
 * is not, and what has to replace it before production.
 *
 * Deliberately outside the `(app)` group: no chrome, no store hydration gate,
 * no role guard. This is the one door that must always render.
 */
const ROLES = ["buyer", "seller", "professional", "admin"] as const;

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  /*
    `?role=` lets a call to action land on the right step instead of dropping
    the visitor back on the chooser they have already answered — the homepage's
    seller and professional panels both arrive this way.

    Validated against the list rather than cast: the value comes from a URL, so
    an unknown one must fall back to the chooser, not render a broken step.
  */
  const raw = Array.isArray(params.role) ? params.role[0] : params.role;
  const role = ROLES.find((r) => r === raw);

  return <SignIn next={next} initialRole={role} />;
}
