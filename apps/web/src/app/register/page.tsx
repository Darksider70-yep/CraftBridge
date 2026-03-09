"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { registerUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "artisan">("buyer");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await registerUser({ email, password, role });
      await login({ email, password });
      router.push(role == "artisan" ? "/upload" : "/discover");
    } catch {
      setError("Registration failed. Try another email or stronger password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return (
      <section className="mx-auto max-w-md rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-bold text-ink">Already signed in</h1>
        <p className="mt-2 text-sm text-slate">
          Continue to discover products or upload a new listing.
        </p>
        <button
          type="button"
          onClick={() => router.push("/discover")}
          className="mt-4 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white"
        >
          Go to Discover
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md rounded-card border border-slate-200 bg-white p-6 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Auth</p>
      <h1 className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-ink">
        Create your account
      </h1>

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
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Account Type
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as "buyer" | "artisan")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
          >
            <option value="buyer">Buyer</option>
            <option value="artisan">Artisan</option>
          </select>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-accent">
          Login
        </Link>
      </p>
    </section>
  );
}

