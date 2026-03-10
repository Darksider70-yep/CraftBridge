import Link from "next/link";
import { motion } from "framer-motion";

import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  showDescription?: boolean;
  showDeleteButton?: boolean;
  onDelete?: (productId: string) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export function ProductCard({ product, showDescription = false, showDeleteButton = false, onDelete }: ProductCardProps) {
  const imageUrl = product.images[0]?.image_url;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm(`Delete "${product.title}"? This action cannot be undone.`)) {
      onDelete(product.id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Link href={`/product/${product.id}`}>
        <motion.div className="group block overflow-hidden rounded-card border border-slate-200/40 bg-white hover:border-primary/30 shadow-soft hover:shadow-cardHover transition-all duration-300 cursor-pointer h-full flex flex-col">
          {/* Image Container with Overlay */}
          <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
            {imageUrl ? (
              <>
                <motion.img
                  src={imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                {/* Overlay gradient on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-craft-gradient text-sm text-slate font-medium">
                <span>No image</span>
              </div>
            )}
            
            {/* Quick View Badge */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="absolute top-3 right-3 px-3 py-1.5 bg-primary/95 text-white text-xs font-semibold rounded-full shadow-soft hover:bg-primaryDark transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              View
            </motion.button>

            {/* In-Stock Indicator */}
            <motion.div
              className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-success"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              In Stock
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col flex-1 space-y-3 p-4 sm:p-5">
            {/* Title and Price - Flex row layout */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-primary transition-colors duration-200 sm:text-base">
                {product.title}
              </h3>
              <motion.span
                className="shrink-0 text-sm font-bold text-primary whitespace-nowrap"
                layoutId={`price-${product.id}`}
              >
                {currencyFormatter.format(product.price)}
              </motion.span>
            </div>

            {/* Description - Optional */}
            {showDescription && product.description ? (
              <p className="line-clamp-2 text-xs sm:text-sm text-slate leading-relaxed">
                {product.description}
              </p>
            ) : null}

            {/* Delete Button - Optional */}
            {showDeleteButton && onDelete && (
              <motion.button
                onClick={handleDelete}
                className="w-full mt-2 px-3 py-2 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Delete Product
              </motion.button>
            )}

            {/* Rating and Artisan Info - Footer */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200/50">
              {/* Artisan */}
              <div className="flex items-center gap-2 min-w-0">
                <motion.div
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  whileHover={{ scale: 1.15 }}
                >
                  {(product.artisan_name?.[0] || "A").toUpperCase()}
                </motion.div>
                <p className="text-xs font-medium text-slate truncate">
                  {product.artisan_name ?? "Artisan"}
                </p>
              </div>

              {/* Rating Stars (Placeholder) */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    className={`text-xs ${i < 4 ? "text-warning" : "text-slate-300"}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    ★
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
