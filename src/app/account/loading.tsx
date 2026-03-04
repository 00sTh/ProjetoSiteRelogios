export default function AccountLoading() {
  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="container mx-auto max-w-3xl space-y-8">
        <div
          className="rounded-2xl p-6 flex items-center gap-4"
          style={{ backgroundColor: "#111111", border: "1px solid rgba(212,175,55,0.2)" }}
        >
          <div className="h-14 w-14 rounded-full animate-pulse" style={{ backgroundColor: "rgba(212,175,55,0.12)" }} />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(212,175,55,0.1)" }} />
            <div className="h-4 w-52 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(212,175,55,0.07)" }} />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl h-28 animate-pulse"
              style={{ backgroundColor: "#111111", border: "1px solid rgba(212,175,55,0.1)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
