"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/reels", label: "Reels" },
  { href: "/artisans", label: "Artisans" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/40 bg-white/95 backdrop-blur-xl shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main navbar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-[0.625rem] bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center group-hover:shadow-cardHover transition-shadow duration-300">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg text-ink group-hover:text-primary transition-colors duration-200">
              CraftBridge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex items-center gap-1"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      active
                        ? "text-primary bg-primary/10 shadow-soft"
                        : "text-slate hover:text-ink hover:bg-slate-50/60"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                        layoutId="navbar-indicator"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-lg hover:bg-slate-100/80 text-slate hover:text-primary transition-all duration-200 group"
              aria-label="Search"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Upload button */}
            <Link
              href="/upload"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary font-medium text-sm hover:bg-primary/5 hover:border-primary/60 transition-all duration-200 group"
            >
              <span className="group-hover:scale-110 transition-transform duration-200 inline-block">+</span>
              <span className="hidden sm:inline">Upload</span>
            </Link>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all duration-200 border border-primary/30"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primaryDark transition-all duration-200 shadow-soft hover:shadow-cardHover"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg hover:bg-slate-100/80 text-slate hover:text-primary transition-all duration-200"
              aria-label="Menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar (expanded) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="overflow-hidden border-t border-slate-200/30 py-4"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search crafts, artisans, categories..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 transition-all duration-200"
                  autoFocus
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="overflow-hidden border-t border-slate-200/30 py-4 space-y-2 md:hidden"
            >
              {LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-slate hover:text-ink hover:bg-slate-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/upload"
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200 border border-primary/30 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                + Upload Product
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
