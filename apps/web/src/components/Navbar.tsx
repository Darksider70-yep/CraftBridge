"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/reels", label: "Reels" },
  { href: "/artisans", label: "Artisans" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-ink sm:text-xl"
        >
          CraftBridge
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  active ? "text-accent" : "text-slate hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/upload"
            className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate transition hover:border-slate-300 hover:text-ink sm:inline-flex"
          >
            Upload
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 sm:inline-flex"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
