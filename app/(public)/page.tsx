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

  // Group by category
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
          className="text-2xl font-semibold text-[#1C1410]"
          style={{ fontFamily: "var(--font-cormorant, serif)" }}
        >
          Collection coming soon
        </h3>
        <p className="text-[#8B7355] text-sm max-w-sm">
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
              className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#C9913A] mb-1"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Full Collection
            </p>
            <h2
              className="text-2xl font-light text-[#1C1410]"
              style={{
                fontFamily: "var(--font-cormorant, serif)",
                letterSpacing: "-0.02em",
              }}
            >
              All Fabrics
            </h2>
          </div>
          <span
            className="text-xs text-[#8B7355]"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* ── Hero ── */}
        <div className="space-y-6 max-w-2xl">
          {/* Personalised greeting if logged in */}
          {isLoggedIn && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(201,145,58,0.08)",
                border: "1px solid rgba(201,145,58,0.2)",
                color: "#C9913A",
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
              className="text-xs font-medium tracking-[0.15em] uppercase text-[#C9913A]"
              style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
            >
              Premium Textile Collection
            </p>
            <h1
              className="text-5xl sm:text-6xl font-light text-[#1C1410] leading-none"
              style={{
                fontFamily: "var(--font-cormorant, serif)",
                letterSpacing: "-0.02em",
              }}
            >
              Fabric for every
              <br />
              <em className="font-semibold not-italic text-[#C9913A]">
                vision.
              </em>
            </h1>
            <p
              className="text-[#8B7355] text-base max-w-md"
              style={{
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
                      className="text-[#C9913A] hover:text-[#1C1410] underline underline-offset-2 transition-[color] duration-150"
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
                      className="text-[#C9913A] hover:text-[#1C1410] underline underline-offset-2 transition-[color] duration-150"
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
                    className="text-[#C9913A] hover:text-[#1C1410] underline underline-offset-2 transition-[color] duration-150"
                  >
                    sign in
                  </Link>{" "}
                  for exclusive bulk rates.
                </>
              )}
            </p>
          </div>

          {/* CTAs — change based on auth state */}
          <div className="flex items-center gap-3 flex-wrap">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-[transform] duration-150"
                  style={{
                    background:
                      "linear-gradient(135deg, #C9913A 0%, #a8742a 100%)",
                    boxShadow: "0 4px 12px rgba(201,145,58,0.3)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Create Account
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    text-[#8B7355] border border-[#C9913A]/20 hover:border-[#C9913A]/40 hover:text-[#C9913A]
                    transition-[color,border-color] duration-150"
                  style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                >
                  Sign In
                </Link>
              </>
            ) : role === "WHOLESALER" || role === "ADMIN" ? (
              <Link
                href="/wholesale/new-arrivals"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-[transform] duration-150"
                style={{
                  background:
                    "linear-gradient(135deg, #C9913A 0%, #a8742a 100%)",
                  boxShadow: "0 4px 12px rgba(201,145,58,0.3)",
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
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-[transform] duration-150"
                style={{
                  background:
                    "linear-gradient(135deg, #C9913A 0%, #a8742a 100%)",
                  boxShadow: "0 4px 12px rgba(201,145,58,0.3)",
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
    </>
  );
}
