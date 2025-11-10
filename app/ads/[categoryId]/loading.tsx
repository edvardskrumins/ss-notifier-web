export default function Loading() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="skeleton bg-zinc-800/60 h-9 w-9 rounded-xl" />
            <div className="skeleton bg-zinc-800/60 h-6 w-56 rounded" />
            <div className="skeleton bg-zinc-800/60 ml-auto h-12 w-12 rounded-xl" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="skeleton bg-zinc-800/60 h-3 w-full rounded" />
            <div className="skeleton bg-zinc-800/60 h-3 w-full rounded" />
            <div className="skeleton bg-zinc-800/60 h-3 w-full rounded" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-sm"
            >
              <div className="skeleton bg-zinc-800/60 h-4 w-1/2 rounded" />
              <div className="skeleton bg-zinc-800/60 h-3 w-1/3 rounded" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="skeleton bg-zinc-800/60 h-10 w-full rounded-xl" />
                <div className="skeleton bg-zinc-800/60 h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <div className="skeleton bg-zinc-800/60 h-10 w-32 rounded-full" />
        </div>
      </div>
    </section>
  );
}
