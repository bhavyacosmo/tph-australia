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
export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  return <SignIn next={next} />;
}
