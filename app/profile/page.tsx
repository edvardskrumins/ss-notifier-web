"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { apiFetch, extractErrorMessage, readJson } from "@/app/lib/apiClient";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type AlertState = {
  type: "success" | "error";
  message: string;
} | null;

export default function ProfilsPage() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [verificationAlert, setVerificationAlert] = useState<AlertState>(null);
  const [verificationPending, setVerificationPending] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordAlert, setPasswordAlert] = useState<AlertState>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordPending, setPasswordPending] = useState(false);

  const isVerified = useMemo(
    () => Boolean(user?.email_verified_at),
    [user?.email_verified_at]
  );

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/user", {
        suppressRedirectOn401: false,
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          "Unable to load user.",
        );
        setError(message);
        setUser(null);
        return;
      }

      const data = await readJson<ApiUser>(response);
      setUser(data);
    } catch (err) {
      console.error("Failed to load user profile", err);
      setError("Unable to load user.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const handleResendVerification = useCallback(async () => {
    setVerificationAlert(null);
    setVerificationPending(true);

    try {
      const response = await apiFetch("/user/email/verification-notification", {
        method: "POST",
      });

      const message = await extractErrorMessage(
        response,
        response.ok
          ? "Verification email sent."
          : "Unable to resend verification email.",
      );

      setVerificationAlert({
        type: response.ok ? "success" : "error",
        message,
      });

      if (response.ok) {
        await loadUser();
      }
    } catch (err) {
      console.error("Failed to resend verification email", err);
      setVerificationAlert({
        type: "error",
        message: "Unable to resend verification email.",
      });
    } finally {
      setVerificationPending(false);
    }
  }, [loadUser]);

  const handlePasswordSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPasswordAlert(null);
      setPasswordErrors([]);

      if (password !== passwordConfirmation) {
        setPasswordErrors(["Passwords do not match."]);
        return;
      }

      setPasswordPending(true);

      try {
        const response = await apiFetch("/user/password", {
          method: "POST",
          body: JSON.stringify({
            password,
            password_confirmation: passwordConfirmation,
          }),
        });

        if (response.status === 422) {
          const data = await response.json().catch(() => null);
          const validationErrors =
            (data &&
              typeof data === "object" &&
              "errors" in data &&
              data.errors &&
              typeof data.errors === "object" &&
              data.errors.password &&
              Array.isArray(data.errors.password)
              ? (data.errors.password as string[])
              : []) ?? [];

          setPasswordErrors(validationErrors);
          setPasswordAlert({
            type: "error",
            message:
              validationErrors[0] ??
              (await extractErrorMessage(
                response,
                "Unable to update password.",
              )),
          });
          return;
        }

        if (!response.ok) {
          setPasswordAlert({
            type: "error",
            message: await extractErrorMessage(
              response,
              "Unable to update password.",
            ),
          });
          return;
        }

        setPasswordAlert({
          type: "success",
          message: "Password updated successfully.",
        });
        setPassword("");
        setPasswordConfirmation("");
        await loadUser();
      } catch (err) {
        console.error("Failed to update password", err);
        setPasswordAlert({
          type: "error",
          message: "Unable to update password.",
        });
      } finally {
        setPasswordPending(false);
      }
    },
    [loadUser, password, passwordConfirmation],
  );

  const handleTogglePasswordForm = useCallback(() => {
    setShowPasswordForm((previous) => {
      const next = !previous;

      if (!next) {
        setPassword("");
        setPasswordConfirmation("");
        setPasswordErrors([]);
        setPasswordAlert(null);
      }

      return next;
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">Profils</h1>
            <p className="text-sm text-zinc-400">
              Manage your account details and security.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-3 text-sm">Loading profile…</span>
          </div>
        ) : error ? (
          <p className="mt-8 text-sm text-red-400">{error}</p>
        ) : user ? (
          <>
            <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="flex flex-col gap-6 md:flex-row md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-400">Name</p>
                  <p className="mt-1 text-lg font-medium text-zinc-100">
                    {user.name}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm font-semibold text-zinc-400">Email</p>
                  <p className="mt-1 break-all text-lg font-medium text-zinc-100">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-2"
                    title={isVerified ? "Email verified" : "Email not verified"}
                  >
                    {isVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-400" aria-hidden />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-400" aria-hidden />
                    )}
                    <span className="text-sm font-medium text-zinc-300">
                      {isVerified ? "Verified" : "Not verified"}
                    </span>
                  </span>
                </div>

                {!isVerified && (
                  <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
                    <button
                      type="button"
                      onClick={() => void handleResendVerification()}
                      disabled={verificationPending}
                      className="rounded-xl border border-purple-400/70 bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {verificationPending ? "Sending…" : "Resend verification email"}
                    </button>
                  </div>
                )}
              </div>

              {verificationAlert && (
                <p
                  className={`mt-4 text-sm ${
                    verificationAlert.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {verificationAlert.message}
                </p>
              )}
            </section>

            <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Change password
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Keep your account secure by using a strong password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePasswordForm}
                  className="self-start rounded-xl border border-purple-400/70 bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90"
                >
                  {showPasswordForm ? "Cancel" : "Change"}
                </button>
              </div>

              {passwordAlert && (
                <p
                  className={`mt-4 text-sm ${
                    passwordAlert.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {passwordAlert.message}
                </p>
              )}

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  showPasswordForm
                    ? "mt-4 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <form
                    onSubmit={(event) => void handlePasswordSubmit(event)}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-zinc-300"
                      >
                        New password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="passwordConfirmation"
                        className="text-sm font-semibold text-zinc-300"
                      >
                        Confirm password
                      </label>
                      <input
                        id="passwordConfirmation"
                        name="passwordConfirmation"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(event) =>
                          setPasswordConfirmation(event.target.value)
                        }
                        required
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {passwordErrors.length > 0 && (
                      <div className="space-y-1">
                        {passwordErrors.map((item, index) => (
                          <p key={`${item}-${index}`} className="text-xs text-red-400">
                            {item}
                          </p>
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={passwordPending}
                      className="w-full rounded-xl border border-purple-400/70 bg-zinc-900/80 px-6 py-2 text-sm font-semibold text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {passwordPending ? "Saving…" : "Save new password"}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}


