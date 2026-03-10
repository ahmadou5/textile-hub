// app/(admin)/admin/inquiries/loading.tsx
export default function InquiriesLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div
          className="h-8 w-40 rounded-xl animate-pulse"
          style={{ background: "rgba(0,0,0,0.06)" }}
        />
        <div
          className="h-3.5 w-32 rounded-full animate-pulse"
          style={{ background: "rgba(0,0,0,0.04)" }}
        />
      </div>

      {/* Status legend skeleton */}
      <div className="flex items-center gap-5">
        {[48, 56, 52].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-full animate-pulse"
            style={{ width: w, background: "rgba(0,0,0,0.05)" }}
          />
        ))}
      </div>

      {/* Row skeletons — 8 items */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Dot */}
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: "#e2e8f0" }}
            />
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0 animate-pulse"
              style={{ background: "#f1ede4" }}
            />
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div
                className="h-3.5 rounded-lg animate-pulse"
                style={{
                  background: "#e2e8f0",
                  width: `${55 + (i % 3) * 12}%`,
                }}
              />
              <div
                className="h-3 rounded-full animate-pulse"
                style={{
                  background: "#f1f5f9",
                  width: `${40 + (i % 4) * 8}%`,
                }}
              />
            </div>
            {/* Right meta */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="h-5 w-16 rounded-full animate-pulse hidden sm:block"
                style={{ background: "#f1f5f9" }}
              />
              <div
                className="h-4 w-12 rounded-full animate-pulse"
                style={{ background: "#f1f5f9" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
