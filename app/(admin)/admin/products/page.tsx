// app/(admin)/admin/products/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import type { Metadata } from "next";
import ProductsTableWithFilter from "@/components/admin/ProductsTableWithFilter";

export const metadata: Metadata = {
  title: "Products — Admin | TextileHub",
};

export default async function AdminProductsPage() {
  await requireRole("ADMIN");

  const products = await db.products.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      retailPricePerYard: true,
      wholesalePricePerYard: true,
      totalYardsInStock: true,
      createdAt: true,
    },
  });

  const lowStockCount = products.filter(
    (p: { totalYardsInStock: number }) => p.totalYardsInStock < 20,
  ).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne, sans-serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Products
          </h1>
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {products.length} products in catalogue
            {lowStockCount > 0 && (
              <Link
                href="/admin/low-stock"
                className="ml-2 font-medium underline underline-offset-2
                  transition-[color] duration-150
                  focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  color: "var(--status-cancelled)",
                  outlineColor: "var(--status-cancelled)",
                }}
              >
                · {lowStockCount} low stock
              </Link>
            )}
          </p>
        </div>

        {/* Add product CTA */}
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
            hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0
            transition-[filter,transform] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            boxShadow: "var(--shadow-brand)",
            outlineColor: "var(--brand-hex)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center rounded-3xl"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <Package
            size={28}
            className="mb-4"
            style={{ color: "var(--text-faint)" }}
          />
          <p
            className="font-medium"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            No products yet
          </p>
          <Link
            href="/admin/products/new"
            className="mt-4 text-sm font-medium transition-[color] duration-150"
            style={{
              color: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            Add your first product →
          </Link>
        </div>
      ) : (
        <ProductsTableWithFilter
          products={products}
          lowStockCount={lowStockCount}
        />
      )}
    </div>
  );
}
