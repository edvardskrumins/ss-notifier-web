"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { z } from "zod";
import { API_URL_WEB } from "@/app/lib/constants";
import { getCookie } from "@/app/lib/cookies";

const RegisterSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email("Invalid email address"),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    passwordConfirmation: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match.",
  });

type FormErrors = Partial<
  Record<keyof z.infer<typeof RegisterSchema>, string[]>
>;

export default function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setMessage(null);

    const validated = RegisterSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      passwordConfirmation: formData.get("passwordConfirmation"),
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

        const payload = {
          name: validated.data.name,
          email: validated.data.email,
          password: validated.data.password,
          password_confirmation: validated.data.passwordConfirmation,
        };

        const response = await fetch(`${API_URL_WEB}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const errorMessage =
            (data && typeof data === "object" && "message" in data
              ? (data as { message?: string }).message
              : undefined) ?? "Unable to register. Please try again.";
          setMessage(errorMessage);
          return;
        }

        window.dispatchEvent(new Event("auth:changed"));
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Register request failed", error);
        setMessage("Unable to register. Please try again.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-zinc-100">Register</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          Login here
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
          <label className="text-sm font-semibold text-zinc-300" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby="name-error"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
          />
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {errors.name?.map((error, index) => (
              <p key={`${error}-${index}`} className="mt-2 text-xs text-red-400">
                {error}
              </p>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
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

        <div>
          <label
            className="text-sm font-semibold text-zinc-300"
            htmlFor="passwordConfirmation"
          >
            Confirm Password
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            required
            aria-invalid={errors.passwordConfirmation ? "true" : "false"}
            aria-describedby="password-confirmation-error"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
          />
          <div
            id="password-confirmation-error"
            aria-live="polite"
            aria-atomic="true"
          >
            {errors.passwordConfirmation?.map((error, index) => (
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
          {pending ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
}
