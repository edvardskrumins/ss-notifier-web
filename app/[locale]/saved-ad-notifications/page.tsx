"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { Link } from "@/app/lib/navigation";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { apiFetch, extractErrorMessage } from "@/app/lib/apiClient";
import { Bookmark, Edit, Power, PowerOff } from "lucide-react";


function buildAdUrl(categoryUrl: string, adId: string): string {
  try {
    const url = new URL(categoryUrl);
    const path = url.pathname;
    const adPath = `/msg${path}${adId}.html`;
    return `${url.origin}${adPath}`;
  } catch {
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

function SavedSearchesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const tNotifications = useTranslations('notifications');
  const [notifications, setNotifications] = useState<AdNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const shownToastRef = useRef<number | null>(null);

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
          t('errors.generic')
        );
        throw new Error(message);
      }

      const json = await response.json();
      setNotifications(json.data || []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('errors.generic');
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
          t('errors.generic')
        );
        throw new Error(message);
      }

      await fetchNotifications();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('errors.generic');
      alert(message);
    } finally {
      setToggling(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const createdId = searchParams.get("created");
    if (createdId && !loading && notifications.length > 0) {
      const notificationId = parseInt(createdId, 10);
      const createdNotification = notifications.find((n) => n.id === notificationId);
      
      if (createdNotification && shownToastRef.current !== notificationId) {
        shownToastRef.current = notificationId;
        
        toast.success(tNotifications('savedSuccessfully'), {
          duration: 4000,
        });

        setHighlightedId(notificationId);
        
        setTimeout(() => {
          setHighlightedId(null);
        }, 5000);

        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("created");
        const newQuery = newSearchParams.toString();
        router.replace(`/saved-ad-notifications${newQuery ? `?${newQuery}` : ""}`);
        
        setTimeout(() => {
          const element = document.getElementById(`notification-${notificationId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    }
  }, [searchParams, notifications, loading, router]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-zinc-400">{t('common.loading')}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-start py-20">
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-100">
          {tNotifications('title')}
        </h1>
        <p className="mt-2 text-zinc-400">
          {tNotifications('description')}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-12 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-zinc-500" />
          <p className="mt-4 text-zinc-400">
            {tNotifications('noNotifications')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              id={`notification-${notification.id}`}
              key={notification.id}
              className={`rounded-3xl border p-6 shadow-xl shadow-black/20 transition-all duration-500 ${
                highlightedId === notification.id
                  ? "border-purple-400/70 bg-zinc-900/70 ring-2 ring-purple-400/50"
                  : "border-zinc-800/80 bg-zinc-900/70"
              }`}
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
                      {notification.active ? tNotifications('active') : tNotifications('inactive')}
                    </span>
                  </div>
                  {notification.category && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {tNotifications('category')}: {notification.category.title}
                    </p>
                  )}
                  {notification.filters.length > 0 && (
                    <p className="mt-1 text-sm text-zinc-500">
                      {notification.filters.length} {tNotifications('filters').toLowerCase()}
                    </p>
                  )}
                  {notification.last_ad_id && notification.category?.url && (
                    <p className="mt-1 text-xs text-zinc-600">
                      {tNotifications('lastAd')}:{" "}
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
                        ? "border-green-400/70 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        : "border-red-400/70 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    title={tNotifications('toggleActive')}
                  >
                    {toggling === notification.id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : notification.active ? (
                      <Power className="h-5 w-5" />
                    ) : (
                      <PowerOff className="h-5 w-5" />
                    )}
                  </button>
                  <Link
                    href={`/saved-ad-notifications/${notification.id}`}
                    className="rounded-xl border border-purple-400/70 bg-purple-500/10 p-2 text-purple-400 transition hover:bg-purple-500/20"
                    title={t('common.edit')}
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

export default function SavedSearchesPage() {
  return (
    <Suspense fallback={
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-zinc-400">Loading...</p>
        </div>
      </section>
    }>
      <SavedSearchesPageContent />
    </Suspense>
  );
}

