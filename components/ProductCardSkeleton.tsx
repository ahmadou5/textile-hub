// components/ProductCardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#EDE8DF] shadow-[0_2px_8px_rgba(28,20,16,0.06)]">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[3/4] rounded-none bg-[#EDE8DF]" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category tag */}
        <Skeleton className="h-4 w-20 rounded-full bg-[#EDE8DF]" />
        {/* Product name */}
        <Skeleton className="h-5 w-3/4 bg-[#EDE8DF]" />
        {/* Price */}
        <Skeleton className="h-5 w-1/3 bg-[#EDE8DF]" />
        {/* Button */}
        <Skeleton className="h-10 w-full rounded-xl bg-[#EDE8DF] mt-1" />
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
