"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  TrendingDown,
  Package,
  AlertTriangle,
  X,
  ChevronDown,
} from "lucide-react";

const LOW_STOCK = 50;

function formatPrice(cents: number) {
  return `₦${(cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

function isNew(date: Date) {
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
}

type Product = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  retailPricePerYard: number;
  wholesalePricePerYard: number;
  totalYardsInStock: number;
  createdAt: Date;
  description: string | null;
};

interface ProductsGridProps {
  products: Product[];
  categories: string[];
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "stock", label: "Most In Stock" },
];

export default function ProductsGrid({
  products,
  categories,
  initialCategory,
  initialSearch,
  initialSort,
}: ProductsGridProps) {
  const [search, setSearch] = useState(initialSearch ?? "");
  const [activeCategory, setActiveCategory] = useState(
    initialCategory ?? "all",
  );
  const [sort, setSort] = useState(initialSort ?? "newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }

    switch (sort) {
      case "price_asc":
        list.sort((a, b) => a.wholesalePricePerYard - b.wholesalePricePerYard);
        break;
      case "price_desc":
        list.sort((a, b) => b.wholesalePricePerYard - a.wholesalePricePerYard);
        break;
      case "stock":
        list.sort((a, b) => b.totalYardsInStock - a.totalYardsInStock);
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    return list;
  }, [products, search, activeCategory, sort]);

  return (
    <div className="space-y-6">
      {/* Search + Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search fabrics, categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600
              bg-white/[0.04] border border-white/10
              focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06]
              transition-[border-color,background] duration-200"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm text-white
              bg-white/[0.04] border border-white/10
              focus:outline-none focus:border-emerald-500/40
              transition-[border-color] duration-200 cursor-pointer"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-slate-900">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>

        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            text-slate-300 border border-white/10 bg-white/[0.04]
            hover:border-emerald-500/30 hover:text-emerald-400
            transition-[border-color,color] duration-200"
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Category pills */}
      <div
        className={`flex flex-wrap gap-2 ${showFilters || "hidden sm:flex"}`}
      >
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-[background,border-color,color] duration-150
            ${
              activeCategory === "all"
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"
                : "bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setActiveCategory(cat === activeCategory ? "all" : cat)
            }
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-[background,border-color,color] duration-150
              ${
                activeCategory === cat
                  ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p
        className="text-xs text-slate-600"
        style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
      >
        Showing{" "}
        <span className="text-slate-400 font-semibold">{filtered.length}</span>{" "}
        of {products.length} products
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <span className="text-5xl">🧵</span>
          <h3
            className="text-xl font-semibold text-white"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            No products found
          </h3>
          <p
            className="text-slate-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
          >
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="text-sm text-emerald-400 underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const isCritical = product.totalYardsInStock < LOW_STOCK;
            const freshDrop = isNew(product.createdAt);
            const savings =
              product.retailPricePerYard - product.wholesalePricePerYard;
            const savingsPct =
              product.retailPricePerYard > 0
                ? Math.round((savings / product.retailPricePerYard) * 100)
                : 0;

            return (
              <Link
                key={product.id}
                href={`/wholesale/products/${product.id}`}
                className="group flex flex-col rounded-2xl border overflow-hidden
                  hover:-translate-y-1
                  transition-[transform,box-shadow,border-color] duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderColor: isCritical
                    ? "rgba(251,191,36,0.2)"
                    : "rgba(255,255,255,0.07)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/3] bg-white/5 flex-shrink-0">
                  {product.imageUrl ? (
                    <>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-[transform] duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-10">🧵</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {freshDrop && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider bg-emerald-500 text-white uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        New
                      </span>
                    )}
                    {isCritical && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/90 text-white uppercase">
                        <AlertTriangle size={8} />
                        Low Stock
                      </span>
                    )}
                  </div>

                  {/* Savings badge */}
                  {savingsPct > 0 && (
                    <div className="absolute bottom-2 right-2">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white">
                        <TrendingDown size={9} />
                        {savingsPct}% off
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 space-y-3">
                  <div>
                    <p
                      className="text-[10px] font-medium tracking-widest uppercase text-slate-500 mb-1"
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      {product.category}
                    </p>
                    <h3
                      className="text-sm font-bold text-white leading-snug group-hover:text-emerald-300 transition-[color] duration-200 line-clamp-2"
                      style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="text-base font-bold text-emerald-400"
                        style={{ fontFamily: "var(--font-syne, sans-serif)" }}
                      >
                        {formatPrice(product.wholesalePricePerYard)}
                      </span>
                      <span className="text-xs text-slate-600">
                        /yd wholesale
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-600 line-through">
                        {formatPrice(product.retailPricePerYard)}
                      </span>
                      <span className="text-xs text-slate-600">retail</span>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span
                      className={`flex items-center gap-1 text-xs ${isCritical ? "text-amber-400" : "text-slate-600"}`}
                      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
                    >
                      <Package size={10} />
                      {product.totalYardsInStock.toLocaleString()} yds
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-500 group-hover:text-emerald-400 transition-colors">
                      View
                      <ArrowUpRight size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
