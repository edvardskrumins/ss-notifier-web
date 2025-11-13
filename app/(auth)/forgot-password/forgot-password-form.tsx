"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { z } from "zod";
import { API_URL_WEB } from "@/app/lib/constants";
import { getCookie } from "@/app/lib/cookies";

const ForgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

type FormErrors = Partial<Record<keyof z.infer<typeof ForgotPasswordSchema>, string[]>>;

type MessageState =
  | {
      type: "success" | "error";
      text: string;
    }
  | null;

export default function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<MessageState>(null);

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setMessage(null);

    const validated = ForgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });

    if (!validated.success) {
      setErrors(validated.error.flatten().fieldErrors);
      setMessage({
        type: "error",
        text: "Please provide a valid email address.",
      });

      return;
    }

    try {
      await fetch(`${API_URL_WEB}/sanctum/csrf-cookie`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("CSRF cookie fetch failed", error);
      setMessage({
        type: "error",
        text: "Unable to reach authentication service.",
      });

      return;
    }

    startTransition(async () => {
      try {
        const xsrfToken = getCookie("XSRF-TOKEN");
        const response = await fetch(`${API_URL_WEB}/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ email: validated.data.email }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const validationErrors =
            data && typeof data === "object" && data !== null && "errors" in data
              ? (data as { errors?: Record<string, string[]> }).errors ?? {}
              : {};

          if ("email" in validationErrors && Array.isArray(validationErrors.email)) {
            setErrors({ email: validationErrors.email });
          }

          const errorMessage =
            (data && typeof data === "object" && data !== null && "message" in data
              ? (data as { message?: string }).message
              : undefined) ?? "We could not process your request. Please try again.";

          setMessage({
            type: "error",
            text: errorMessage,
          });

          return;
        }

        const successMessage =
          (data && typeof data === "object" && data !== null && "status" in data
            ? (data as { status?: string }).status
            : undefined) ??
          "If your email address is registered, you will receive a password reset link shortly.";

        setMessage({
          type: "success",
          text: successMessage,
        });
      } catch (error) {
        console.error("Forgot password request failed", error);
        setMessage({
          type: "error",
          text: "Unable to process your request. Please try again.",
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-zinc-100">Forgot password</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Enter your email address and we&apos;ll send you instructions to reset your password.
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

        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-purple-400/70 bg-zinc-900/80 px-6 py-2 text-sm font-semibold text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Sending link…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}

