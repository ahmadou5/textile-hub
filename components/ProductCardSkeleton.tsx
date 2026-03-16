// components/ProductCardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-brand)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Image placeholder */}
      <Skeleton
        className="w-full aspect-[3/4] rounded-none"
        style={{ background: "var(--bg-subtle)" }}
      />

      {/* Content */}
      <div className="p-4 space-y-3">
        <Skeleton
          className="h-4 w-20 rounded-full"
          style={{ background: "var(--bg-subtle)" }}
        />
        <Skeleton
          className="h-5 w-3/4"
          style={{ background: "var(--bg-subtle)" }}
        />
        <Skeleton
          className="h-5 w-1/3"
          style={{ background: "var(--bg-subtle)" }}
        />
        <Skeleton
          className="h-10 w-full rounded-xl mt-1"
          style={{ background: "var(--bg-subtle)" }}
        />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
