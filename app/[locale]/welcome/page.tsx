"use client";

import { Link } from "@/app/lib/navigation";
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
    <main className="flex  flex-col items-center justify-center ">
      <section className="max-w-2xl space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-10 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          E-pasta adrese apstiprināta!
        </h1>
        <p className="text-sm flex items-center justify-center text-zinc-300 sm:text-base">
          Tavs konts ir verificēts. Vari turpināt izmantot ss-notifier! 
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-purple-400/70 bg-zinc-900/80 px-6 py-3 text-sm font-medium text-white transition hover:border-purple-300 hover:bg-zinc-900/90"
          >
            Doties uz sākumlapu
          </Link>
        </div>
      </section>
    </main>
  );
}

