"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { API_URL_WEB } from "@/app/lib/constants";
import { getCookie } from "@/app/lib/cookies";

export default function LogoutForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogout = async () => {
    setMessage(null);
    setSuccess(false);

    try {
      await fetch(`${API_URL_WEB}/sanctum/csrf-cookie`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("CSRF cookie fetch failed", error);
      setMessage("Unable to reach authentication service.");
      return;
    }

    startTransition(async () => {
      try {
        const xsrfToken = getCookie("XSRF-TOKEN");

        const response = await fetch(`${API_URL_WEB}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
          },
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const errorMessage =
            (data && typeof data === "object" && "message" in data
              ? (data as { message?: string }).message
              : undefined) ?? "Unable to logout. Please try again.";
          setMessage(errorMessage);
          return;
        }

        setSuccess(true);
        setMessage("You have been logged out.");
        router.push("/login");
        router.refresh();
      } catch (error) {
        console.error("Logout request failed", error);
        setMessage("Unable to logout. Please try again.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-lg">
      <h1 className="text-2xl font-semibold text-zinc-100">Logout</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Click the button below to end your session securely.
      </p>

      <button
        onClick={handleLogout}
        disabled={pending}
        className="mt-6 w-full rounded-full bg-blue-500 px-6 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Logging out…" : "Logout"}
      </button>

      {message && (
        <p
          className={`mt-4 text-sm ${
            success ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
