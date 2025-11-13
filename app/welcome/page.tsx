"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthChange = () => {
      router.refresh();
    };

    window.addEventListener("auth:changed", handleAuthChange);

    return () => window.removeEventListener("auth:changed", handleAuthChange);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-16 text-center text-zinc-100">
      <section className="max-w-2xl space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-10 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          E-pasta adrese apstiprināta!
        </h1>
        <p className="text-sm text-zinc-300 sm:text-base">
          Vēstule tika apstiprināta un Tavs konts ir aktivizēts. Vari turpināt
          izmantot aplikāciju — novērtējam Tavu pacietību!
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-blue-500/60 bg-blue-500/20 px-6 py-3 text-sm font-medium text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/30"
          >
            Doties uz sākumlapu
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/80"
          >
            Pierakstīties
          </Link>
        </div>
      </section>
    </main>
  );
}

