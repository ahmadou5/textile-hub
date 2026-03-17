// app/(admin)/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Package, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

const CATEGORIES = [
  "Ankara / African Print",
  "Aso-oke",
  "Kente",
  "Lace & Embroidery",
  "Plain Cotton",
  "Silk & Satin",
  "Chiffon",
  "Denim",
  "Velvet",
  "Organza",
  "Other",
];

const formSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  retailPricePerYard: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Enter a valid retail price",
    }),
  wholesalePricePerYard: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Enter a valid wholesale price",
    }),
  totalYardsInStock: z
    .string()
    .refine((v) => !isNaN(parseInt(v)) && parseInt(v) >= 0, {
      message: "Enter a valid stock quantity",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const retail = parseFloat(watch("retailPricePerYard") || "0");
  const wholesale = parseFloat(watch("wholesalePricePerYard") || "0");
  const priceDiff =
    retail > 0 && wholesale > 0 && retail > wholesale
      ? (((retail - wholesale) / retail) * 100).toFixed(0)
      : null;

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        category: values.category,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
        retailPricePerYard: parseFloat(values.retailPricePerYard),
        wholesalePricePerYard: parseFloat(values.wholesalePricePerYard),
        totalYardsInStock: parseInt(values.totalYardsInStock),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess(true);
    toast.success("Product published!", {
      description: `${data.name} is now live in the catalogue.`,
      icon: "🧵",
    });
    setTimeout(() => router.push("/admin/products"), 1200);
  }

  return (
    <div className="p-6 lg:p-8 w-[90%] mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm transition-[color] duration-150 group
          focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          color: "var(--text-muted)",
          outlineColor: "var(--brand-hex)",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        <ArrowLeft
          size={15}
          className="group-hover:-translate-x-0.5 transition-[transform] duration-150"
        />
        Back to Products
      </Link>

      {/* Page header */}
      <div className="space-y-1">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-syne, sans-serif)",
            letterSpacing: "-0.02em",
          }}
        >
          Add New Product
        </h1>
        <p
          className="text-sm"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          Prices are entered in your currency — stored as integers internally.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <Card
          className="border shadow-none"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-brand)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader
            className="pb-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <CardTitle
              className="text-base font-semibold flex items-center gap-2"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              <Package size={16} style={{ color: "var(--brand-hex)" }} />
              Product Information
            </CardTitle>
            <CardDescription style={{ color: "var(--text-faint)" }}>
              Basic details visible to all users
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Product Name{" "}
                <span style={{ color: "var(--status-cancelled)" }}>*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Royal Blue Ankara Print"
                {...register("name")}
                className="text-sm outline-none transition-[border-color,box-shadow] duration-200"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--brand-hex)";
                  e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {errors.name && (
                <p
                  className="text-xs"
                  style={{ color: "var(--status-cancelled)" }}
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Category{" "}
                <span style={{ color: "var(--status-cancelled)" }}>*</span>
              </Label>
              <Select onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger
                  className="text-sm transition-[border-color,box-shadow] duration-200"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  <SelectValue
                    placeholder="Select fabric category…"
                    style={{ color: "var(--text-faint)" }}
                  />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-brand)",
                    color: "var(--text-primary)",
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p
                  className="text-xs"
                  style={{ color: "var(--status-cancelled)" }}
                >
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Description{" "}
                <span
                  className="font-normal normal-case tracking-normal"
                  style={{ color: "var(--text-faint)" }}
                >
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder="Material composition, pattern details, care instructions…"
                rows={3}
                {...register("description")}
                className="text-sm outline-none resize-none transition-[border-color,box-shadow] duration-200"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--brand-hex)";
                  e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="imageUrl"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Image URL{" "}
                <span
                  className="font-normal normal-case tracking-normal"
                  style={{ color: "var(--text-faint)" }}
                >
                  (optional)
                </span>
              </Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/fabric-image.jpg"
                {...register("imageUrl")}
                className="text-sm outline-none transition-[border-color,box-shadow] duration-200"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--brand-hex)";
                  e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {errors.imageUrl && (
                <p
                  className="text-xs"
                  style={{ color: "var(--status-cancelled)" }}
                >
                  {errors.imageUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card
          className="border shadow-none"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-brand)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader
            className="pb-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <CardTitle
              className="text-base font-semibold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              Pricing per Yard
            </CardTitle>
            <CardDescription style={{ color: "var(--text-faint)" }}>
              Enter in your currency (₦ or $). Stored as integers to avoid
              floating point errors.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Retail price */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="retailPrice"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Retail Price / Yard{" "}
                  <span style={{ color: "var(--status-cancelled)" }}>*</span>
                </Label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
                    style={{ color: "var(--text-faint)" }}
                  >
                    ₦
                  </span>
                  <Input
                    id="retailPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1500.00"
                    {...register("retailPricePerYard")}
                    className="pl-7 text-sm outline-none transition-[border-color,box-shadow] duration-200"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--brand-hex)";
                      e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                {errors.retailPricePerYard && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--status-cancelled)" }}
                  >
                    {errors.retailPricePerYard.message}
                  </p>
                )}
              </div>

              {/* Wholesale price */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="wholesalePrice"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Wholesale Price / Yard{" "}
                  <span style={{ color: "var(--status-cancelled)" }}>*</span>
                </Label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
                    style={{ color: "var(--text-faint)" }}
                  >
                    ₦
                  </span>
                  <Input
                    id="wholesalePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1200.00"
                    {...register("wholesalePricePerYard")}
                    className="pl-7 text-sm outline-none transition-[border-color,box-shadow] duration-200"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--brand-hex)";
                      e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                {errors.wholesalePricePerYard && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--status-cancelled)" }}
                  >
                    {errors.wholesalePricePerYard.message}
                  </p>
                )}
              </div>
            </div>

            {/* Live margin indicator */}
            {priceDiff && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(5,150,105,0.08)",
                  border: "1px solid rgba(5,150,105,0.2)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--status-confirmed)" }}
                />
                <p
                  className="text-xs font-medium"
                  style={{
                    color: "var(--status-confirmed)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Wholesale is{" "}
                  <span className="font-bold">{priceDiff}% below retail</span> —
                  margin looks good
                </p>
              </div>
            )}

            {retail > 0 && wholesale >= retail && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.2)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--status-cancelled)" }}
                />
                <p
                  className="text-xs font-medium"
                  style={{
                    color: "var(--status-cancelled)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                >
                  Wholesale price must be lower than retail price
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock */}
        <Card
          className="border shadow-none"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-brand)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CardHeader
            className="pb-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <CardTitle
              className="text-base font-semibold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-syne, sans-serif)",
              }}
            >
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-1.5 max-w-xs">
              <Label
                htmlFor="stock"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Total Yards in Stock{" "}
                <span style={{ color: "var(--status-cancelled)" }}>*</span>
              </Label>
              <div className="relative">
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="500"
                  {...register("totalYardsInStock")}
                  className="text-sm outline-none transition-[border-color,box-shadow] duration-200"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--brand-hex)";
                    e.target.style.boxShadow = "0 0 0 3px var(--brand-glow)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                  style={{ color: "var(--text-faint)" }}
                >
                  yds
                </span>
              </div>
              {errors.totalYardsInStock && (
                <p
                  className="text-xs"
                  style={{ color: "var(--status-cancelled)" }}
                >
                  {errors.totalYardsInStock.message}
                </p>
              )}
              <p
                className="text-xs"
                style={{
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                Items below 20 yards will trigger a low stock alert.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "var(--status-cancelled)" }}
            />
            <p
              className="text-sm"
              style={{
                color: "var(--status-cancelled)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(5,150,105,0.08)",
              border: "1px solid rgba(5,150,105,0.2)",
            }}
          >
            <CheckCircle2
              size={16}
              className="flex-shrink-0"
              style={{ color: "var(--status-confirmed)" }}
            />
            <p
              className="text-sm font-medium"
              style={{
                color: "var(--status-confirmed)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Product created! Redirecting…
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <Button
            type="submit"
            disabled={loading || success}
            className="px-8 py-2.5 rounded-xl font-semibold text-sm text-white
              hover:brightness-105 hover:-translate-y-0.5
              active:translate-y-0 active:brightness-95
              transition-[transform,filter,box-shadow] duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{
              background: `linear-gradient(135deg, var(--brand-hex) 0%, var(--brand-dim) 100%)`,
              boxShadow: "var(--shadow-brand)",
              outlineColor: "var(--brand-hex)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </span>
            ) : success ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} />
                Saved!
              </span>
            ) : (
              "Save Product"
            )}
          </Button>

          <Link href="/admin/products">
            <Button
              type="button"
              variant="ghost"
              className="transition-[color] duration-150"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
