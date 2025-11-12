export default function Loading() {
  return (
    <section >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="skeleton bg-zinc-800/60 h-9 w-9 rounded-xl" />
            <div className="skeleton bg-zinc-800/60 h-6 w-48 rounded" />
            <div className="skeleton bg-zinc-800/60 ml-auto h-12 w-12 rounded-xl" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="skeleton bg-zinc-800/60 h-3 w-full rounded" />
            <div className="skeleton bg-zinc-800/60 h-3 w-full rounded" />
            <div className="skeleton bg-zinc-800/60 h-3 w-full rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="skeleton bg-zinc-800/60 h-4 w-2/3 rounded" />
                <div className="skeleton bg-zinc-800/60 h-3 w-8 rounded" />
              </div>
              <div className="skeleton bg-zinc-800/60 mt-2 h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
