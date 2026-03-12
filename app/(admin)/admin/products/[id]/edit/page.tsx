// app/(admin)/admin/products/[id]/edit/page.tsx
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductEditForm from "@/components/admin/ProductEditForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Product — Admin | TextileHub",
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole("ADMIN");

  const product = await db.products.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-transform duration-150"
        />
        Back to Products
      </Link>

      <div>
        <h1
          className="text-2xl font-bold text-slate-800"
          style={{ fontFamily: "var(--font-playfair, serif)" }}
        >
          Edit Product
        </h1>
        <p
          className="text-sm text-slate-500 mt-1"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Changes are saved immediately on submit.
        </p>
      </div>

      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          category: product.category,
          imageUrl: product.imageUrl ?? "",
          // convert cents back to naira for display
          retailPricePerYard: product.retailPricePerYard / 100,
          wholesalePricePerYard: product.wholesalePricePerYard / 100,
          totalYardsInStock: product.totalYardsInStock,
        }}
      />
    </div>
  );
}
