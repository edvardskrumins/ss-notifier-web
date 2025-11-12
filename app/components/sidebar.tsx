"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Home, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { apiFetch } from "@/app/lib/apiClient";
import { API_URL_WEB } from "@/app/lib/constants";
import { getCookie } from "@/app/lib/cookies";

type ApiUser = {
  name: string;
};

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth >= 1024;
  });
  const [user, setUser] = useState<ApiUser | null>(null);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiFetch("/user", {
        credentials: "include",
        suppressRedirectOn401: true,
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data: ApiUser = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      setUser(null);
    }
  }, []);

  const handleNavigate = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);

    try {
      await fetch(`${API_URL_WEB}/sanctum/csrf-cookie`, {
        credentials: "include",
      });

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
        console.error("Logout request failed", await response.text());
      }

      await refreshUser();
      window.dispatchEvent(new Event("auth:changed"));
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register") {
      const timeout = setTimeout(() => {
        refreshUser();
      }, 0);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [pathname, refreshUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateOffset = () => {
      const shouldShift = window.innerWidth >= 1024 && isOpen;
      document.body.style.setProperty(
        "--sidebar-offset",
        shouldShift ? "16rem" : "0px"
      );
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      document.body.style.removeProperty("--sidebar-offset");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener("auth:changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth:changed", handleAuthChange);
    };
  }, [refreshUser]);

  const isAuthenticated = !!user;

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        className="fixed left-4 top-4 z-50 rounded-full border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-200 shadow transition hover:border-zinc-700 hover:bg-zinc-900"
      >
        <Menu
          className={`h-6 w-6 transform-gpu transition-transform duration-500 ease-out ${
            isOpen ? "rotate-[90deg] scale-110" : "rotate-0 scale-100"
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          role="presentation"
          onClick={toggleSidebar}
        />
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-zinc-800 bg-zinc-900 p-6 pt-20 text-zinc-100 shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sākuma navigācija"
      >
        <div className="mb-8 flex items-center gap-3 border-b border-zinc-800 pb-4">
          {isAuthenticated && (
            <>
              <UserIcon className="h-6 w-6 text-zinc-300" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {user?.name ?? ""}
                </p>
              </div>
            </>
          ) }
        </div>

        <ul className="space-y-3">
          <li>
            <Link
              href="/"
              onClick={handleNavigate}
              className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium transition hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <Home className="h-5 w-5 text-blue-400" />
              Sākums
            </Link>
          </li>

          <li>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium transition hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <LogOut className="h-5 w-5 text-red-400" />
                Atslēgties
              </button>
            ) : (
              <Link
                href="/login"
                onClick={handleNavigate}
                className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium transition hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <LogIn className="h-5 w-5 text-green-400" />
                Pieslēgties
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}

