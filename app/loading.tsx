export default function Loading() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="skeleton bg-zinc-800/60 h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton bg-zinc-800/60 h-4 w-3/4 rounded" />
                  <div className="skeleton bg-zinc-800/60 h-3 w-1/2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
