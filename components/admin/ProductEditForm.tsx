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

const inputStyle: React.CSSProperties = {
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-dm-sans, sans-serif)",
};

const labelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontFamily: "var(--font-dm-sans, sans-serif)",
};

function focusIn(
  e: React.FocusEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) {
  e.target.style.borderColor = "var(--brand-hex)";
  e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
}

function focusOut(
  e: React.FocusEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) {
  e.target.style.borderColor = "var(--border)";
  e.target.style.boxShadow = "none";
}

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

  const fieldClass =
    "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-200";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl p-6"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-brand)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Name */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Product Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          className={fieldClass}
          style={inputStyle}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      </div>

      {/* Category */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={fieldClass}
          style={inputStyle}
          onFocus={focusIn}
          onBlur={focusOut}
        >
          {CATEGORIES.map((c) => (
            <option
              key={c}
              value={c}
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
            >
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={`${fieldClass} resize-none`}
          style={inputStyle}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      </div>

      {/* Image URL */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
        >
          Image URL
        </label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://..."
          className={fieldClass}
          style={inputStyle}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={labelStyle}
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
            className={fieldClass}
            style={inputStyle}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={labelStyle}
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
            className={fieldClass}
            style={inputStyle}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>
      </div>

      {/* Stock */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={labelStyle}
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
          className={fieldClass}
          style={inputStyle}
          onFocus={focusIn}
          onBlur={focusOut}
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
            transition-[transform] duration-150"
          style={{
            background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
            boxShadow: "var(--shadow-brand)",
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
