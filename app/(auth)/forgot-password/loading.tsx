export default function Loading() {
  return (
    <section className="mx-auto flex max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-lg">
        <div className="skeleton bg-zinc-800/60 h-7 w-40 rounded" />
        <div className="skeleton bg-zinc-800/60 mt-3 h-4 w-full rounded" />
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="skeleton bg-zinc-800/60 h-4 w-16 rounded" />
            <div className="skeleton bg-zinc-800/60 h-10 w-full rounded-xl" />
          </div>
          <div className="skeleton bg-blue-500/40 h-10 w-full rounded-full" />
          <div className="skeleton bg-zinc-800/60 h-10 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}

