// app/(wholesale)/wholesale/new-arrivals/loading.tsx
export default function NewArrivalsLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 lg:max-w-7xl w-[90%] mx-auto">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div
          className="h-3 w-24 rounded-full animate-pulse"
          style={{ background: "rgba(16,185,129,0.15)" }}
        />
        <div
          className="h-8 w-48 rounded-xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="h-3 w-64 rounded-full animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>

      {/* Feed skeleton — 5 cards */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-5 p-5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            animationDelay: `${i * 80}ms`,
          }}
        >
          {/* Image placeholder */}
          <div
            className="w-24 h-24 rounded-2xl flex-shrink-0 animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />

          {/* Content */}
          <div className="flex-1 space-y-3 py-1">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div
                  className="h-4 w-3/4 rounded-lg animate-pulse"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <div
                  className="h-3 w-1/3 rounded-full animate-pulse"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              </div>
              <div
                className="h-6 w-16 rounded-lg animate-pulse flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.1)" }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div
                className="h-3 w-20 rounded-full animate-pulse"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
              <div
                className="h-3 w-16 rounded-full animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>

            <div
              className="h-8 w-full rounded-xl animate-pulse mt-2"
              style={{ background: "rgba(16,185,129,0.06)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
