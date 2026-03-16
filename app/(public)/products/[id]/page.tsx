// app/(public)/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductActions from "@/components/ProductDetailActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.products.findUnique({
    where: { id },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — TextileHub`,
    description:
      product.description ??
      `Premium ${product.name} fabric available by the yard.`,
  };
}

function formatPrice(cents: number): string {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as string | undefined;

  const product = await db.products.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      imageUrl: true,
      retailPricePerYard: true,
      wholesalePricePerYard: true,
    },
  });

  if (!product) notFound();

  // Show wholesale price only to WHOLESALER and ADMIN
  const canSeeWholesale = role === "WHOLESALER" || role === "ADMIN";
  const displayPrice = canSeeWholesale
    ? product.wholesalePricePerYard
    : product.retailPricePerYard;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-8 group
          transition-[color] duration-150
          focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ color: "var(--text-muted)", outlineColor: "var(--brand-hex)" }}
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
        />
        Back to Catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image panel */}
        <div className="space-y-4">
          <div
            className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden"
            style={{
              background: "var(--bg-subtle)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {product.imageUrl ? (
              <>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.08)]" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center opacity-20 space-y-3">
                  <div className="text-7xl">🧵</div>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-syne, sans-serif)",
                    }}
                  >
                    No image available
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category tag */}
          <span
            className="inline-block px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
            style={{
              background: "var(--bg-subtle)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {product.category}
          </span>
        </div>

        {/* Info panel */}
        <div className="space-y-8 lg:pt-4">
          {/* Title + price */}
          <div
            className="space-y-3 pb-6"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h1
              className="text-4xl sm:text-5xl font-semibold leading-tight"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.02em",
              }}
            >
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl font-semibold"
                  style={{
                    color: "var(--brand-hex)",
                    fontFamily: "var(--font-syne, sans-serif)",
                  }}
                >
                  {formatPrice(displayPrice)}
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  per yard
                </span>
              </div>

              {/* Wholesale badge */}
              {canSeeWholesale && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--brand-glow)",
                    color: "var(--brand-hex)",
                    border: "1px solid var(--border-brand)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Wholesale price
                </span>
              )}

              {/* Retail strikethrough for wholesalers */}
              {canSeeWholesale && (
                <span
                  className="text-sm line-through"
                  style={{
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  {formatPrice(product.retailPricePerYard)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h2
                className="text-xs font-semibold tracking-[0.12em] uppercase"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                About this fabric
              </h2>
              <p
                className="text-base"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                  lineHeight: "1.75",
                }}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* ── Client component: qty + cart + inquiry ── */}
          <ProductActions
            product={{
              id: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              pricePerYard: displayPrice,
            }}
            isLoggedIn={isLoggedIn}
            role={role}
          />

          {/* Wholesale CTA — only shown to guests */}
          {!isLoggedIn && (
            <div
              className="rounded-2xl p-5 space-y-2"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-brand)",
              }}
            >
              <p
                className="font-semibold text-base"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-syne, sans-serif)",
                }}
              >
                Need bulk quantities?
              </p>
              <p
                className="text-sm"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                  lineHeight: "1.6",
                }}
              >
                Wholesalers get exclusive per-yard rates. Register or sign in
                for B2B pricing.
              </p>
              <div className="flex gap-3 pt-1">
                <Link
                  href="/login"
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-white
                    hover:brightness-110 active:brightness-95
                    transition-[filter] duration-150
                    focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
                    boxShadow: "var(--shadow-brand)",
                    outlineColor: "var(--brand-hex)",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 rounded-xl
                    transition-[border-color,color] duration-150
                    focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    border: "1px solid var(--border-brand)",
                    color: "var(--text-muted)",
                    outlineColor: "var(--brand-hex)",
                  }}
                >
                  Apply for Wholesale
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
