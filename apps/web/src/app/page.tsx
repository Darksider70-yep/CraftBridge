import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-8 shadow-card sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          CraftBridge Marketplace
        </p>
        <h1 className="mt-4 max-w-3xl font-[var(--font-heading)] text-3xl font-extrabold leading-tight text-ink sm:text-5xl">
          Discover handmade stories, not just products.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate sm:text-lg">
          Upload artisan catalogs, browse discovery-ready listings, and scroll reel-style craft stories in a single flow.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/discover"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Explore Marketplace
          </Link>
          <Link
            href="/upload"
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-ink"
          >
            Upload Product
          </Link>
          <Link
            href="/reels"
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-ink"
          >
            Watch Reels
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step 1</p>
          <h2 className="mt-2 text-lg font-bold text-ink">Upload Product</h2>
          <p className="mt-2 text-sm text-slate">
            Artisan submits product metadata and image through the upload form.
          </p>
        </article>
        <article className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step 2</p>
          <h2 className="mt-2 text-lg font-bold text-ink">Persist & Sync</h2>
          <p className="mt-2 text-sm text-slate">
            Product and media URL are saved in PostgreSQL through API Gateway services.
          </p>
        </article>
        <article className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step 3</p>
          <h2 className="mt-2 text-lg font-bold text-ink">Appear in UI</h2>
          <p className="mt-2 text-sm text-slate">
            Listing surfaces in discovery feed, storefront, and product detail pages.
          </p>
        </article>
      </section>
    </div>
  );
}

