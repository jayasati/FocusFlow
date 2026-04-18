import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function HeroPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          LifeOS
        </Link>
        <div className="flex items-center gap-3 text-sm font-medium">
          <SignInButton forceRedirectUrl="/dashboard">Sign in</SignInButton>
          <SignUpButton forceRedirectUrl="/dashboard">Sign up</SignUpButton>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Your life, organized.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Tasks, time, habits, journal, study, goals, and finance — all in one
          place.
        </p>
        <div className="flex items-center gap-3 text-sm font-medium">
          <SignUpButton forceRedirectUrl="/dashboard">Get started</SignUpButton>
          <SignInButton forceRedirectUrl="/dashboard">Sign in</SignInButton>
        </div>
      </main>
    </div>
  );
}
