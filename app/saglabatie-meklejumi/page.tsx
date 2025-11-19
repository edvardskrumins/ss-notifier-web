"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, extractErrorMessage } from "@/app/lib/apiClient";
import { Bookmark, Edit, Power, PowerOff } from "lucide-react";

/**
 * Build the correct ad URL from category URL and ad ID.
 * Category URL format: https://www.ss.com/lv/transport/cars/bmw/760/
 * Ad URL format: https://www.ss.com/msg/lv/transport/cars/bmw/760/jeijo.html
 */
function buildAdUrl(categoryUrl: string, adId: string): string {
  try {
    const url = new URL(categoryUrl);
    // Extract the path (e.g., /lv/transport/cars/bmw/760/)
    const path = url.pathname;
    // Prepend /msg and append the ad ID with .html extension
    const adPath = `/msg${path}${adId}.html`;
    // Reconstruct the full URL
    return `${url.origin}${adPath}`;
  } catch {
    // Fallback if URL parsing fails
    return `https://www.ss.com/msg${categoryUrl.replace('https://www.ss.com', '')}${adId}.html`;
  }
}

type AdNotificationFilter = {
  id: number;
  filter_id: number;
  value: string;
  filter_value_id: number | null;
  is_min: boolean | null;
};

type Category = {
  id: number;
  title: string;
  url: string | null;
  type: string;
};

type AdNotification = {
  id: number;
  name: string;
  active: boolean;
  last_ad_id: string | null;
  category: Category | null;
  filters: AdNotificationFilter[];
  created_at: string;
  updated_at: string;
};

export default function SavedSearchesPage() {
  const [notifications, setNotifications] = useState<AdNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/ad-notifications", {
        credentials: "include",
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          "Neizdevās ielādēt saglabātos meklējumus."
        );
        throw new Error(message);
      }

      const json = await response.json();
      setNotifications(json.data || []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Radās neparedzēta kļūda. Mēģiniet vēlreiz.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      setToggling(id);
      const response = await apiFetch(`/ad-notifications/${id}/toggle-active`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          "Neizdevās mainīt statusu."
        );
        throw new Error(message);
      }

      // Refresh the list
      await fetchNotifications();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Radās neparedzēta kļūda. Mēģiniet vēlreiz.";
      alert(message);
    } finally {
      setToggling(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-zinc-400">Ielādē...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-100">
          Saglabātie meklējumi
        </h1>
        <p className="mt-2 text-zinc-400">
          Pārvaldiet savus saglabātos meklējumus un to statusu
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-12 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-zinc-500" />
          <p className="mt-4 text-zinc-400">
            Jums nav saglabātu meklējumu. Izveidojiet jaunu meklējumu, lai
            sāktu saņemt paziņojumus.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-6 shadow-xl shadow-black/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-zinc-100">
                      {notification.name}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        notification.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {notification.active ? "Aktīvs" : "Neaktīvs"}
                    </span>
                  </div>
                  {notification.category && (
                    <p className="mt-2 text-sm text-zinc-400">
                      Kategorija: {notification.category.title}
                    </p>
                  )}
                  {notification.filters.length > 0 && (
                    <p className="mt-1 text-sm text-zinc-500">
                      {notification.filters.length} filtr{notification.filters.length > 1 ? "i" : "s"}
                    </p>
                  )}
                  {notification.last_ad_id && notification.category?.url && (
                    <p className="mt-1 text-xs text-zinc-600">
                      Pēdējais sludinājums:{" "}
                      <Link
                        href={buildAdUrl(notification.category.url, notification.last_ad_id)}
                        target="_blank"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {notification.last_ad_id}
                      </Link>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(notification.id)}
                    disabled={toggling === notification.id}
                    className={`rounded-xl border p-2 transition ${
                      notification.active
                        ? "border-red-400/70 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "border-green-400/70 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    title={
                      notification.active
                        ? "Deaktivizēt"
                        : "Aktivizēt"
                    }
                  >
                    {toggling === notification.id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : notification.active ? (
                      <PowerOff className="h-5 w-5" />
                    ) : (
                      <Power className="h-5 w-5" />
                    )}
                  </button>
                  <Link
                    href={`/saglabatie-meklejumi/${notification.id}`}
                    className="rounded-xl border border-purple-400/70 bg-purple-500/10 p-2 text-purple-400 transition hover:bg-purple-500/20"
                    title="Rediģēt"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

