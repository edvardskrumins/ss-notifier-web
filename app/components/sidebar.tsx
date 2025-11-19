"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Home, LogIn, LogOut, User as UserIcon, ArrowRightToLine, Bookmark } from "lucide-react";
import { apiFetch } from "@/app/lib/apiClient";
import { API_URL_WEB } from "@/app/lib/constants";
import { getCookie } from "@/app/lib/cookies";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setHasMounted(true);

    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsOpen(true);
    }
  }, []);

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

      const data = await response.json();
      setUser(data.data as ApiUser);
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
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }

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
  const sidebarOpen = hasMounted ? isOpen : false;

  return (
    <>
      <div
        className={`flex justify-start bg-transparent px-4 pt-4 transition-opacity duration-200 ${
          sidebarOpen ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
          aria-expanded={sidebarOpen}
          className="rounded-xl border border-purple-400/70 bg-zinc-900/80 p-3 text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90"
        >
          <Menu
            className={`h-6 w-6 text-white transform-gpu transition-transform duration-500 ease-out ${
              sidebarOpen ? "rotate-[180deg] scale-110" : "rotate-0 scale-100"
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          role="presentation"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-zinc-800 bg-zinc-900 text-zinc-100 shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav
          className="relative flex h-full flex-col p-6 pt-20"
          aria-label="Sākuma navigācija"
        >
          <div className="absolute right-6 top-6">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse navigation"
              className="rounded-xl border border-purple-400/70 bg-zinc-900/80 p-3 text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90"
            >
              <ArrowRightToLine
                className={`h-5 w-5 text-white transform-gpu transition-transform duration-500 ease-out ${
                  sidebarOpen ? "rotate-[180deg] scale-110" : "rotate-0 scale-100"
                }`}
              />
            </button>
          </div>

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
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition hover:border-zinc-700 hover:bg-zinc-900/80 ${
                pathname === "/" ? "border-zinc-700 bg-zinc-900/80" : "border-transparent"
              }`}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              <Home className="h-5 w-5 text-blue-400" />
              Sākums
            </Link>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <Link
                  href="/saglabatie-meklejumi"
                  onClick={handleNavigate}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition hover:border-zinc-700 hover:bg-zinc-900/80 ${
                    pathname?.startsWith("/saglabatie-meklejumi") ? "border-zinc-700 bg-zinc-900/80" : "border-transparent"
                  }`}
                  aria-current={pathname?.startsWith("/saglabatie-meklejumi") ? "page" : undefined}
                >
                  <Bookmark className="h-5 w-5 text-yellow-400" />
                  Saglabātie meklējumi
                </Link>
              </li>
              <li>
                <Link
                  href="/profils"
                  onClick={handleNavigate}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition hover:border-zinc-700 hover:bg-zinc-900/80 ${
                    pathname === "/profils" ? "border-zinc-700 bg-zinc-900/80" : "border-transparent"
                  }`}
                  aria-current={pathname === "/profils" ? "page" : undefined}
                >
                  <UserIcon className="h-5 w-5 text-purple-300" />
                  Profils
                </Link>
              </li>
            </>
          )}

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
      </div>
    </>
  );
}

