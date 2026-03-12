"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    retailPricePerYard: number;
    wholesalePricePerYard: number;
    totalYardsInStock: number;
  };
}

const CATEGORIES = [
  "Cotton",
  "Linen",
  "Silk",
  "Wool",
  "Polyester",
  "Chiffon",
  "Velvet",
  "Denim",
  "Lace",
  "Other",
];

export default function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrl: product.imageUrl,
    retailPricePerYard: product.retailPricePerYard.toString(),
    wholesalePricePerYard: product.wholesalePricePerYard.toString(),
    totalYardsInStock: product.totalYardsInStock.toString(),
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const retail = parseFloat(form.retailPricePerYard);
    const wholesale = parseFloat(form.wholesalePricePerYard);

    if (isNaN(retail) || isNaN(wholesale)) {
      toast.error("Please enter valid prices");
      return;
    }
    if (wholesale >= retail) {
      toast.error("Wholesale price must be less than retail price");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          imageUrl: form.imageUrl || null,
          retailPricePerYard: retail,
          wholesalePricePerYard: wholesale,
          totalYardsInStock: parseInt(form.totalYardsInStock),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update product");
        return;
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm text-slate-800
    bg-white border border-slate-200 placeholder:text-slate-400
    focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]/20
    transition-[border-color,box-shadow] duration-200`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Name */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Product Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          className={inputClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
      </div>

      {/* Category */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={inputClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
      </div>

      {/* Image URL */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Image URL
        </label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://..."
          className={inputClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className={labelClass}
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Retail Price / Yard (₦)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.retailPricePerYard}
            onChange={(e) => set("retailPricePerYard", e.target.value)}
            required
            className={inputClass}
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          />
        </div>
        <div>
          <label
            className={labelClass}
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Wholesale Price / Yard (₦)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.wholesalePricePerYard}
            onChange={(e) => set("wholesalePricePerYard", e.target.value)}
            required
            className={inputClass}
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          />
        </div>
      </div>

      {/* Stock */}
      <div>
        <label
          className={labelClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          Total Yards in Stock
        </label>
        <input
          type="number"
          min="0"
          step="1"
          value={form.totalYardsInStock}
          onChange={(e) => set("totalYardsInStock", e.target.value)}
          required
          className={inputClass}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:-translate-y-0.5 active:translate-y-0
            transition-[transform,background] duration-150"
          style={{
            background: "linear-gradient(135deg, #D4A853 0%, #b8893a 100%)",
            boxShadow: "0 2px 8px rgba(212,168,83,0.3)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={14} /> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
