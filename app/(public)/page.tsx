// app/(public)/page.tsx
import { Suspense } from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import CategoryScrollSection from "@/components/CategoryScrollSection";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

// ── Fetch all products + group by category ────────────────────────────────
async function getProducts() {
  const products = await db.products.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      retailPricePerYard: true,
      imageUrl: true,
      totalYardsInStock: true,
      createdAt: true,
    },
  });

  const byCategory = products.reduce<Record<string, typeof products>>(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {},
  );

  return { products, byCategory };
}

// ── All products grid ─────────────────────────────────────────────────────
async function ProductGrid({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { products, byCategory } = await getProducts();
  const categories = Object.keys(byCategory);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="text-5xl">🧵</div>
        <h3
          className="text-2xl font-semibold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
          }}
        >
          Collection coming soon
        </h3>
        <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
          Our curated fabric collection is being prepared. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* ── Category scroll sections ── */}
      {categories.map((category) => (
        <CategoryScrollSection
          key={category}
          category={category}
          products={byCategory[category]}
          isLoggedIn={isLoggedIn}
        />
      ))}

      {/* ── All products grid ── */}
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1"
              style={{
                color: "var(--brand-hex)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Full Collection
            </p>
            <h2
              className="text-2xl font-light"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
                letterSpacing: "-0.02em",
              }}
            >
              All Fabrics
            </h2>
          </div>
          <span
            className="text-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {products.length} item{products.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as string | undefined;
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ── Hero ── */}
      <div className="space-y-6 max-w-2xl">
        {/* Personalised greeting */}
        {isLoggedIn && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "var(--brand-glow)",
              border: "1px solid var(--border-brand)",
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            <ShieldCheck size={12} />
            Welcome back{firstName ? `, ${firstName}` : ""}
            {role === "WHOLESALER" && " — Wholesale pricing available"}
            {role === "ADMIN" && " — Admin access"}
          </div>
        )}

        <div className="space-y-3">
          <p
            className="text-xs font-medium tracking-[0.15em] uppercase"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Premium Textile Collection
          </p>
          <h1
            className="text-5xl sm:text-6xl font-light leading-none"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Fabric for every
            <br />
            <em
              className="font-semibold not-italic"
              style={{ color: "var(--brand-hex)" }}
            >
              vision.
            </em>
          </h1>
          <p
            className="text-base max-w-md"
            style={{
              color: "var(--text-muted)",
              lineHeight: "1.7",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Sourced from across West Africa and beyond.{" "}
            {isLoggedIn ? (
              role === "WHOLESALER" || role === "ADMIN" ? (
                <>
                  Browse wholesale prices in the{" "}
                  <Link
                    href="/wholesale/products"
                    className="underline underline-offset-2 transition-[color] duration-150"
                    style={{ color: "var(--brand-hex)" }}
                  >
                    wholesale portal
                  </Link>
                  .
                </>
              ) : (
                <>
                  Retail pricing shown.{" "}
                  <Link
                    href="/profile"
                    className="underline underline-offset-2 transition-[color] duration-150"
                    style={{ color: "var(--brand-hex)" }}
                  >
                    Upgrade your account
                  </Link>{" "}
                  for bulk rates.
                </>
              )
            ) : (
              <>
                Retail pricing shown — wholesalers{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-2 transition-[color] duration-150"
                  style={{ color: "var(--brand-hex)" }}
                >
                  sign in
                </Link>{" "}
                for exclusive bulk rates.
              </>
            )}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isLoggedIn ? (
            <>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                  hover:-translate-y-0.5 active:translate-y-0 transition-[transform] duration-150"
                style={{
                  background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
                  boxShadow: "var(--shadow-brand)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Create Account
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-[color,border-color] duration-150"
                style={{
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-brand)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
                onMouseEnter={undefined} // server component — no event handlers
              >
                Sign In
              </Link>
            </>
          ) : role === "WHOLESALER" || role === "ADMIN" ? (
            <Link
              href="/wholesale/new-arrivals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                hover:-translate-y-0.5 active:translate-y-0 transition-[transform] duration-150"
              style={{
                background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
                boxShadow: "var(--shadow-brand)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              <Sparkles size={14} />
              View New Arrivals
            </Link>
          ) : (
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                hover:-translate-y-0.5 active:translate-y-0 transition-[transform] duration-150"
              style={{
                background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
                boxShadow: "var(--shadow-brand)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Request Wholesale Access
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* ── Products ── */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid isLoggedIn={isLoggedIn} />
      </Suspense>
    </div>
  );
}
