import Link from "next/link";

import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  showDescription?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ProductCard({ product, showDescription = false }: ProductCardProps) {
  const imageUrl = product.images[0]?.image_url;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-card border border-slate-200/80 bg-white shadow-card transition duration-200 hover:-translate-y-1"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-sm text-slate">
            No image
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-ink sm:text-base">
            {product.title}
          </h3>
          <span className="shrink-0 text-sm font-bold text-accent">
            {currencyFormatter.format(product.price)}
          </span>
        </div>
        {showDescription && product.description ? (
          <p className="line-clamp-2 text-sm text-slate">{product.description}</p>
        ) : null}
        <p className="text-xs font-medium uppercase tracking-wide text-slate">
          {product.artisan_name ?? "Artisan"}
        </p>
      </div>
    </Link>
  );
}
