export default function Loading() {
  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-lg">
        <div className="skeleton bg-zinc-800/60 mx-auto h-7 w-24 rounded" />
        <div className="skeleton bg-zinc-800/60 mx-auto mt-3 h-4 w-56 rounded" />
        <div className="skeleton bg-blue-500/40 mx-auto mt-6 h-10 w-full rounded-full" />
      </div>
    </section>
  );
}

