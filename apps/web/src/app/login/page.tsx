"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      router.push("/upload");
    } catch {
      setError("Login failed. Check credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return (
      <section className="mx-auto max-w-md rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-bold text-ink">Already signed in</h1>
        <p className="mt-2 text-sm text-slate">Continue to upload your next product listing.</p>
        <button
          type="button"
          onClick={() => router.push("/upload")}
          className="mt-4 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white"
        >
          Go to Upload
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md rounded-card border border-slate-200 bg-white p-6 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Auth</p>
      <h1 className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-ink">Login to ShilpSetu</h1>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-ink">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate">
        New here?{" "}
        <Link href="/register" className="font-semibold text-accent">
          Create an account
        </Link>
      </p>
    </section>
  );
}

