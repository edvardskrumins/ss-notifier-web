"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { API_URL_WEB } from "@/app/lib/constants";
import { getCookie } from "@/app/lib/cookies";

const ResetPasswordSchema = z
  .object({
    email: z.email("Invalid email address"),
    token: z.string().min(1, { message: "Reset token is missing." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirmation: z
      .string()
      .min(8, { message: "Password confirmation must be at least 8 characters." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords must match.",
  });

type FormFields = z.infer<typeof ResetPasswordSchema>;
type FormErrors = Partial<Record<keyof FormFields, string[]>>;

type MessageState =
  | {
      type: "success" | "error";
      text: string;
    }
  | null;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<MessageState>(null);

  const queryData = useMemo(() => {
    const token = searchParams.get("token") ?? "";
    const email = searchParams.get("email") ?? "";

    return { token, email };
  }, [searchParams]);

  useEffect(() => {
    if (!queryData.token) {
      setMessage({
        type: "error",
        text: "Reset token is missing. Please request a new password reset link.",
      });
    }
  }, [queryData.token]);

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setMessage(null);

    const validated = ResetPasswordSchema.safeParse({
      email: formData.get("email"),
      token: formData.get("token"),
      password: formData.get("password"),
      passwordConfirmation: formData.get("passwordConfirmation"),
    });

    if (!validated.success) {
      setErrors(validated.error.flatten().fieldErrors as FormErrors);
      setMessage({
        type: "error",
        text: "Please fix the highlighted issues and try again.",
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
        const response = await fetch(`${API_URL_WEB}/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            email: validated.data.email,
            token: validated.data.token,
            password: validated.data.password,
            password_confirmation: validated.data.passwordConfirmation,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const validationErrors =
            data && typeof data === "object" && data !== null && "errors" in data
              ? (data as { errors?: Record<string, string[]> }).errors ?? {}
              : {};

          const newErrors: FormErrors = {};
          (Object.keys(validationErrors) as Array<keyof FormErrors>).forEach((key) => {
            const value = validationErrors[key];
            if (Array.isArray(value)) {
              newErrors[key] = value;
            }
          });

          setErrors(newErrors);

          const errorMessage =
            (data && typeof data === "object" && data !== null && "message" in data
              ? (data as { message?: string }).message
              : undefined) ?? "We could not reset your password. Please try again.";

          setMessage({
            type: "error",
            text: errorMessage,
          });

          return;
        }

        const successMessage =
          (data && typeof data === "object" && data !== null && "status" in data
            ? (data as { status?: string }).status
            : undefined) ?? "Your password has been reset successfully.";

        setMessage({
          type: "success",
          text: successMessage,
        });

        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 1500);
      } catch (error) {
        console.error("Reset password request failed", error);
        setMessage({
          type: "error",
          text: "Unable to reset your password. Please try again.",
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-zinc-100">Reset password</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Choose a new password for your account. Make sure it&apos;s something secure.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(new FormData(event.currentTarget));
        }}
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="token" value={queryData.token} />

        <div>
          <label className="text-sm font-semibold text-zinc-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={queryData.email}
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
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby="password-error"
            required
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
          <label className="text-sm font-semibold text-zinc-300" htmlFor="passwordConfirmation">
            Confirm new password
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            aria-invalid={errors.passwordConfirmation ? "true" : "false"}
            aria-describedby="password-confirmation-error"
            required
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
          />
          <div id="password-confirmation-error" aria-live="polite" aria-atomic="true">
            {errors.passwordConfirmation?.map((error, index) => (
              <p key={`${error}-${index}`} className="mt-2 text-xs text-red-400">
                {error}
              </p>
            ))}
          </div>
        </div>

        {errors.token?.length ? (
          <div aria-live="polite" aria-atomic="true">
            {errors.token.map((error, index) => (
              <p key={`${error}-${index}`} className="text-xs text-red-400">
                {error}
              </p>
            ))}
          </div>
        ) : null}

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
          {pending ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

