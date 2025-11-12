export default function Loading() {
  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-lg">
        <div className="skeleton bg-zinc-800/60 h-7 w-28 rounded" />
        <div className="skeleton bg-zinc-800/60 mt-3 h-4 w-48 rounded" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="skeleton bg-zinc-800/60 h-4 w-24 rounded" />
              <div className="skeleton bg-zinc-800/60 h-10 w-full rounded-xl" />
            </div>
          ))}
          <div className="skeleton bg-blue-500/40 h-10 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}

