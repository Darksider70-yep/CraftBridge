"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Product, getProduct } from "@/lib/api";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProduct(params.id)
      .then((data) => setProduct(data))
      .catch(() => setError("Product not found."))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return <p className="text-sm text-slate">Loading product...</p>;
  }

  if (!product || error) {
    return <p className="text-sm text-red-600">{error ?? "Product not found."}</p>;
  }

  const imageUrl = product.images[0]?.image_url;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-card">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex aspect-square items-center justify-center bg-slate-100 text-sm text-slate">
            No image
          </div>
        )}
      </div>

      <article className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Product</p>
        <h1 className="mt-1 font-[var(--font-heading)] text-3xl font-bold text-ink">
          {product.title}
        </h1>
        <p className="mt-2 text-sm text-slate">{product.category}</p>
        <p className="mt-4 text-2xl font-bold text-accent">
          {currencyFormatter.format(product.price)}
        </p>
        <p className="mt-4 text-sm text-slate">
          {product.description ?? "No description available for this listing."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/artisan/${product.artisan_id}`}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Visit Artisan Storefront
          </Link>
          <Link
            href="/discover"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to Discover
          </Link>
        </div>
      </article>
    </section>
  );
}

