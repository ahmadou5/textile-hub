// components/wholesale/WholesaleFeedSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

function WholesaleCardSkeleton() {
  return (
    <div
      className="flex gap-4 p-4 rounded-2xl border"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* Thumbnail */}
      <Skeleton
        className="w-24 h-24 rounded-xl flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />

      {/* Content left */}
      <div className="flex-1 space-y-2.5 py-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <Skeleton
              className="h-3 w-16 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <Skeleton
              className="h-5 w-3/5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>
          <Skeleton
            className="h-4 w-20 rounded-full flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <Skeleton
            className="h-6 w-24 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <Skeleton
            className="h-5 w-16 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Skeleton
            className="h-3 w-24 rounded"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <Skeleton
            className="h-8 w-32 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function WholesaleFeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <WholesaleCardSkeleton key={i} />
      ))}
    </div>
  );
}
