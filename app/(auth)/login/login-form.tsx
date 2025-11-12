"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { z } from "zod";
import { API_URL_WEB } from "@/app/lib/constants";
import { getCookie } from "@/app/lib/cookies";

const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormErrors = Partial<Record<keyof z.infer<typeof LoginSchema>, string[]>>;

export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setMessage(null);

    const validated = LoginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validated.success) {
      setErrors(validated.error.flatten().fieldErrors);
      setMessage("Fill all required fields.");
      return;
    }

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

        const response = await fetch(`${API_URL_WEB}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
          },
          credentials: "include",
          body: JSON.stringify(validated.data),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const errorMessage =
            (data && typeof data === "object" && "message" in data
              ? (data as { message?: string }).message
              : undefined) ?? "Unable to login. Please check your credentials.";
          setMessage(errorMessage);
          return;
        }

        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Login request failed", error);
        setMessage("Unable to login. Please try again.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-zinc-100">Login</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-400 hover:text-blue-300">
          Register here
        </Link>
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(new FormData(event.currentTarget));
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="text-sm font-semibold text-zinc-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
            required
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
          />
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {errors.email?.map((error, index) => (
              <p key={`${error}-${index}`} className="mt-2 text-xs text-red-400">
                {error}
              </p>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby="password-error"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
          />
          <div id="password-error" aria-live="polite" aria-atomic="true">
            {errors.password?.map((error, index) => (
              <p key={`${error}-${index}`} className="mt-2 text-xs text-red-400">
                {error}
              </p>
            ))}
          </div>
        </div>

        {message && <p className="text-sm text-red-400">{message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-blue-500 px-6 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
