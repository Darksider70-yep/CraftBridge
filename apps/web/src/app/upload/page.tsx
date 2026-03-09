"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { uploadProduct } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length >= 2 &&
      category.trim().length >= 2 &&
      Number(price) > 0 &&
      images.length > 0
    );
  }, [title, category, price, images.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Please login before uploading a product.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const product = await uploadProduct(
        {
          title,
          description,
          price: Number(price),
          category,
          images,
        },
        {
          token,
          onUploadProgress: setUploadProgress,
        },
      );

      router.push(`/artisan/${product.artisan_id}`);
    } catch {
      setError(
        "Upload failed. Ensure artisan profile exists and form fields are valid.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate">Checking session...</p>;
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-xl rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-bold text-ink">Login Required</h1>
        <p className="mt-2 text-sm text-slate">
          Product upload is available for authenticated artisan accounts.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
        >
          Go to Login
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Artisan Studio</p>
      <h1 className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-ink sm:text-3xl">
        Upload New Product
      </h1>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-ink">
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-ink">
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Category
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-accent"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-ink">
          Product Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setImages(Array.from(event.target.files ?? []))}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        {isSubmitting ? (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate">Uploading... {uploadProgress}%</p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Uploading..." : "Upload Product"}
        </button>
      </form>
    </section>
  );
}

