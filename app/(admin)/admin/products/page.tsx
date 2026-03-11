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
    <div className="p-6 lg:p-8 space-y-6 w-[90%] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-3xl font-bold text-slate-800 tracking-tight"
            style={{
              fontFamily: "var(--font-playfair, serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Products
          </h1>
          <p
            className="text-slate-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {products.length} products in catalogue
            {lowStockCount > 0 && (
              <Link
                href="/admin/low-stock"
                className="ml-2 text-red-500 hover:text-red-700 font-medium
                  transition-[color] duration-150 underline underline-offset-2
                  focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500"
              >
                · {lowStockCount} low stock
              </Link>
            )}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            text-white bg-[#D4A853]
            shadow-[0_2px_8px_rgba(212,168,83,0.3)]
            hover:brightness-105 hover:-translate-y-0.5
            active:translate-y-0
            transition-[filter,transform,box-shadow] duration-150
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A853]"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
            background: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Package size={28} className="text-slate-300 mb-4" />
          <p
            className="text-slate-500 font-medium"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            No products yet
          </p>
          <Link
            href="/admin/products/new"
            className="mt-4 text-sm text-[#D4A853] hover:text-slate-800 font-medium
              transition-[color] duration-150"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
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
