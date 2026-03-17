// app/(admin)/admin/inquiries/loading.tsx
export default function InquiriesLoading() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div
          className="h-8 w-40 rounded-xl animate-pulse"
          style={{ background: "var(--bg-subtle)" }}
        />
        <div
          className="h-3.5 w-32 rounded-full animate-pulse"
          style={{ background: "var(--bg-subtle)" }}
        />
      </div>

      {/* Status legend skeleton */}
      <div className="flex items-center gap-5">
        {[48, 56, 52].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-full animate-pulse"
            style={{ width: w, background: "var(--bg-subtle)" }}
          />
        ))}
      </div>

      {/* Row skeletons — 8 items */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl animate-pulse"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-brand)",
              animationDelay: `${i * 60}ms`,
            }}
          >
            {/* Status dot */}
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: "var(--border)" }}
            />

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0"
              style={{ background: "var(--bg-subtle)" }}
            />

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div
                className="h-3.5 rounded-lg"
                style={{
                  background: "var(--bg-subtle)",
                  width: `${55 + (i % 3) * 12}%`,
                }}
              />
              <div
                className="h-3 rounded-full"
                style={{
                  background: "var(--border-subtle)",
                  width: `${40 + (i % 4) * 8}%`,
                }}
              />
            </div>

            {/* Right meta */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="h-5 w-16 rounded-full hidden sm:block"
                style={{ background: "var(--bg-subtle)" }}
              />
              <div
                className="h-4 w-12 rounded-full"
                style={{ background: "var(--bg-subtle)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
