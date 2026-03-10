"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { getProducts, Product } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        setFeaturedProducts(products.slice(0, 8));
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="space-y-20">
      {/* ===== HERO SECTION ===== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-[2rem] bg-hero-gradient pt-16 pb-24 px-6 sm:px-16 lg:px-20 text-white"
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
          >
            <p className="text-sm font-semibold">🌟 Welcome to ShilpSetu</p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-[var(--font-heading)] text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
          >
            Discover Handmade<br />Stories Worldwide
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl leading-relaxed"
          >
            Browse authentic artisan crafts, watch inspiring reel stories, and connect directly with creators from around the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:shadow-cardHover transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>Explore Marketplace</span>
              <span className="text-lg">→</span>
            </Link>
            <Link
              href="/reels"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>Watch Reels</span>
              <span className="text-lg">▶</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== FEATURES/BENEFITS SECTION ===== */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-3"
      >
        <motion.div
          variants={fadeInUp}
          className="group rounded-card border border-slate-200/50 bg-white p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
        >
          <motion.div
            className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:from-primary/30 transition-all duration-300"
            whileHover={{ rotate: 10 }}
          >
            🎨
          </motion.div>
          <h3 className="mt-5 font-[var(--font-heading)] font-bold text-xl text-ink">
            Handcrafted Quality
          </h3>
          <p className="mt-3 text-base text-slate leading-relaxed">
            Authentic artisan products directly from independent creators worldwide.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="group rounded-card border border-slate-200/50 bg-white p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
        >
          <motion.div
            className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:from-primary/30 transition-all duration-300"
            whileHover={{ rotate: 10 }}
          >
            🎬
          </motion.div>
          <h3 className="mt-5 font-[var(--font-heading)] font-bold text-xl text-ink">
            Reel Stories
          </h3>
          <p className="mt-3 text-base text-slate leading-relaxed">
            Scroll through short-form videos showcasing craft techniques and artisan behind-the-scenes.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="group rounded-card border border-slate-200/50 bg-white p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
        >
          <motion.div
            className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:from-primary/30 transition-all duration-300"
            whileHover={{ rotate: 10 }}
          >
            👥
          </motion.div>
          <h3 className="mt-5 font-[var(--font-heading)] font-bold text-xl text-ink">
            Meet Artisans
          </h3>
          <p className="mt-3 text-base text-slate leading-relaxed">
            Explore artist profiles, their unique stories, and complete product collections.
          </p>
        </motion.div>
      </motion.section>

      {/* ===== FEATURED PRODUCTS SECTION ===== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-4xl sm:text-5xl font-[var(--font-heading)] font-bold text-ink">
              Featured Crafts
            </h2>
            <p className="mt-2 text-slate text-lg">
              Curated selections from talented artisans
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-primary hover:text-primaryDark font-semibold transition-colors duration-200"
          >
            <span>View All</span>
            <span className="text-xl">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-80 rounded-card bg-gradient-to-br from-slate-200 to-slate-100"
              />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-card bg-slate-50 border border-slate-200"
          >
            <p className="text-slate text-lg">Coming soon... Be the first to explore!</p>
          </motion.div>
        )}
      </motion.section>

      {/* ===== ARTISAN CTA SECTION ===== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2rem] bg-accent-gradient pt-16 pb-20 px-6 sm:px-16 lg:px-20 text-white"
      >
        {/* Decorative elements */}
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-[var(--font-heading)] font-bold leading-tight"
          >
            Are you a Craftsperson?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-white/95 leading-relaxed"
          >
            Upload your handmade products to our marketplace and connect with customers worldwide. It's free, easy, and your craft deserves to be seen.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent font-semibold rounded-lg hover:shadow-cardHover transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>Start Selling Now</span>
              <span>→</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-[var(--font-heading)] font-bold text-ink mb-4">
            Get Started in 3 Steps
          </h2>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            Whether you're a buyer or artisan, ShilpSetu makes it simple
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3"
        >
          {[
            {
              step: "01",
              title: "Discover",
              desc: "Browse thousands of handcrafted products from artisans worldwide with detailed photos and stories.",
              icon: "🔍",
            },
            {
              step: "02",
              title: "Connect",
              desc: "View artisan profiles, watch their craft stories, and connect directly with the creators.",
              icon: "🤝",
            },
            {
              step: "03",
              title: "Support",
              desc: "Purchase directly from artisans, support small businesses, and own something truly unique.",
              icon: "❤️",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="group relative rounded-card border border-slate-200/50 bg-white p-10 shadow-soft hover:shadow-card transition-all duration-300 hover:border-primary/30"
            >
              {/* Step badge */}
              <motion.div
                className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-[var(--font-heading)] font-bold text-lg shadow-card group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 360 }}
              >
                {item.step}
              </motion.div>

              {/* Icon */}
              <motion.div
                className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-300"
                whileHover={{ rotate: 12 }}
              >
                {item.icon}
              </motion.div>

              <h3 className="text-2xl font-[var(--font-heading)] font-bold text-ink mb-4">
                {item.title}
              </h3>
              <p className="text-slate text-base leading-relaxed">
                {item.desc}
              </p>

              {/* Decorative line connecting steps (on desktop) */}
              {i < 2 && (
                <motion.div
                  className="hidden md:block absolute -right-4 top-1/2 w-8 h-1 bg-primary/30 transform -translate-y-1/2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}

