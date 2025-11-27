"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiFetch, extractErrorMessage } from "@/app/lib/apiClient";
import { getAds, FilterEntity } from "@/server/categories";

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

export default function EditSavedSearchPage() {
  const params = useParams();
  const router = useRouter();
  const notificationId = params.id as string;

  const [notification, setNotification] = useState<AdNotification | null>(null);
  const [filters, setFilters] = useState<FilterEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch notification
        const notificationResponse = await apiFetch(
          `/ad-notifications/${notificationId}`,
          {
            credentials: "include",
          }
        );

        if (!notificationResponse.ok) {
          const message = await extractErrorMessage(
            notificationResponse,
            "Neizdevās ielādēt meklējumu."
          );
          throw new Error(message);
        }

        const notificationJson = await notificationResponse.json();
        const notificationData = notificationJson.data as AdNotification;
        setNotification(notificationData);

        if (!notificationData.category) {
          throw new Error("Meklējumam nav kategorijas.");
        }

        // Fetch filters for the category
        const filtersData = await getAds(notificationData.category.id);
        setFilters(filtersData.filters);
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

    if (notificationId) {
      fetchData();
    }
  }, [notificationId]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-zinc-400">Ielādē...</p>
        </div>
      </section>
    );
  }

  if (error || !notification) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-red-400">{error || "Meklējums nav atrasts."}</p>
        </div>
      </section>
    );
  }

  if (!notification.category) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-red-400">Meklējumam nav kategorijas.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/saved-ad-notifications"
          className="rounded-xl border border-zinc-800 p-2 bg-zinc-900/70 hover:bg-zinc-900"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Rediģēt meklējumu: {notification.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {notification.category.title}
          </p>
        </div>
      </div>

      <EditAdsForm
        filters={filters}
        categoryId={notification.category.id}
        notification={notification}
      />
    </section>
  );
}

// Wrapper component that pre-fills the form
function EditAdsForm({
  filters,
  categoryId,
  notification,
}: {
  filters: FilterEntity[];
  categoryId: number;
  notification: AdNotification;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build initial form values from notification filters
  const getInitialValues = () => {
    const values: Record<string, string> = {
      name: notification.name,
    };

    // Group filters by filter_id to handle ranges
    const filterGroups = new Map<
      number,
      { min?: AdNotificationFilter; max?: AdNotificationFilter; single?: AdNotificationFilter }
    >();

    notification.filters.forEach((nf) => {
      if (!filterGroups.has(nf.filter_id)) {
        filterGroups.set(nf.filter_id, {});
      }
      const group = filterGroups.get(nf.filter_id)!;

      if (nf.is_min === true) {
        group.min = nf;
      } else if (nf.is_min === false) {
        group.max = nf;
      } else {
        group.single = nf;
      }
    });

    filters.forEach((filter) => {
      const baseName = filter.form_param ?? `filter_${filter.id}`;
      const group = filterGroups.get(filter.id);

      if (!group) return;

      if (filter.type === "custom_range" || filter.type === "select_range") {
        if (group.min) {
          values[`${baseName}_from`] = group.min.value;
        }
        if (group.max) {
          values[`${baseName}_to`] = group.max.value;
        }
      } else {
        if (group.single) {
          values[baseName] = group.single.value;
        }
      }
    });

    return values;
  };

  const initialValues = getInitialValues();

  // We need to modify AdsForm to accept initial values
  // For now, we'll create a custom form handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const nameValue = formData.get("name");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";

    if (!name) {
      setError("Nosaukums ir obligāts.");
      setPending(false);
      return;
    }

    // Build filter selections (same logic as AdsForm)
    const selections: any[] = [];

    filters.forEach((filter) => {
      const baseName = filter.form_param ?? `filter_${filter.id}`;

      if (filter.type === "custom_range" || filter.type === "select_range") {
        const fromValue = formData.get(`${baseName}_from`);
        const toValue = formData.get(`${baseName}_to`);

        const rangeValue: any = {};

        if (fromValue && typeof fromValue === "string" && fromValue !== "") {
          const matched =
            filter.type === "select_range"
              ? filter.values.find((v) => v.value === fromValue)
              : null;

          rangeValue.from = {
            value: fromValue,
            filter_value_id: matched?.id ?? null,
          };
        }

        if (toValue && typeof toValue === "string" && toValue !== "") {
          const matched =
            filter.type === "select_range"
              ? filter.values.find((v) => v.value === toValue)
              : null;

          rangeValue.to = {
            value: toValue,
            filter_value_id: matched?.id ?? null,
          };
        }

        if (rangeValue.from || rangeValue.to) {
          selections.push({
            filter_id: filter.id,
            label: filter.label,
            value: rangeValue,
          });
        }
      } else {
        const value = formData.get(baseName);
        if (value && typeof value === "string" && value !== "") {
          const filterValueId =
            filter.type === "select"
              ? filter.values.find((v) => v.value === value)?.id ?? null
              : null;

          selections.push({
            filter_id: filter.id,
            label: filter.label,
            value,
            filter_value_id: filterValueId,
          });
        }
      }
    });

    const payload = {
      name,
      filters: selections,
    };

    try {
      const response = await apiFetch(`/ad-notifications/${notification.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          "Neizdevās atjaunināt paziņojumu."
        );
        throw new Error(message);
      }

      setSuccess("Paziņojums veiksmīgi atjaunināts.");
      setTimeout(() => {
        router.push("/saved-ad-notifications");
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Radās neparedzēta kļūda. Mēģiniet vēlreiz.";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  // Render form fields with initial values
  const renderFilterField = (filter: FilterEntity) => {
    const baseName = filter.form_param ?? `filter_${filter.id}`;
    const fromValue = initialValues[`${baseName}_from`] || "";
    const toValue = initialValues[`${baseName}_to`] || "";
    const singleValue = initialValues[baseName] || "";

    switch (filter.type) {
      case "custom_range":
        return (
          <div className="mt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="number"
                name={`${baseName}_from`}
                placeholder="Min"
                defaultValue={fromValue}
                className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
              <span className="text-center text-zinc-500" aria-hidden="true">
                -
              </span>
              <input
                type="number"
                name={`${baseName}_to`}
                placeholder="Max"
                defaultValue={toValue}
                className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>
        );

      case "custom_text":
        return (
          <input
            type="text"
            name={baseName}
            maxLength={filter.max_length ?? undefined}
            placeholder={filter.label}
            defaultValue={singleValue}
            className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
        );

      case "select":
        return (
          <select
            name={baseName}
            defaultValue={singleValue}
            className="mt-3 w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
            }}
          >
            <option value="" disabled>
              Izvēlies opciju
            </option>
            {filter.values.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label ?? option.value}
              </option>
            ))}
          </select>
        );

      case "select_range":
        return (
          <div className="mt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <select
                name={`${baseName}_from`}
                defaultValue={fromValue}
                className="w-full flex-1 appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                }}
              >
                <option value="" disabled>
                  Min
                </option>
                {filter.values.map((option) => (
                  <option key={`${option.id}-from`} value={option.value}>
                    {option.label ?? option.value}
                  </option>
                ))}
              </select>
              <span className="text-zinc-500" aria-hidden="true">
                -
              </span>
              <select
                name={`${baseName}_to`}
                defaultValue={toValue}
                className="w-full flex-1 appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                }}
              >
                <option value="" disabled>
                  Max
                </option>
                {filter.values.map((option) => (
                  <option key={`${option.id}-to`} value={option.value}>
                    {option.label ?? option.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form className="mt-8 w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-8 shadow-xl shadow-black/20">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="mx-auto w-full space-y-2 border-b border-zinc-800/70 pb-6 text-left sm:w-[85%] md:w-[75%]">
            <div className="space-y-1">
              <label
                className="text-sm font-semibold text-zinc-100"
                htmlFor="default_name"
              >
                Nosaukums{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
            </div>
            <input
              id="default_name"
              name="name"
              required
              type="text"
              placeholder="Nosaukums"
              defaultValue={initialValues.name}
              className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          {filters.map((filter) => (
            <div
              key={filter.id}
              className="mx-auto w-full space-y-2 border-b border-zinc-800/70 pb-6 text-left last:border-none last:pb-0 sm:w-[85%] md:w-[75%]"
            >
              <div className="space-y-1">
                <div className="text-sm font-semibold text-zinc-100">
                  {filter.label}
                </div>
              </div>
              {renderFilterField(filter)}
            </div>
          ))}
        </div>

        <div className="mt-4 flex w-full flex-col items-center gap-4 sm:w-[85%] md:w-[75%]">
          {success && <p className="text-sm text-green-400">{success}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-xl border border-purple-400/70 bg-zinc-900/80 px-6 py-2 text-sm font-semibold text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Saglabāju..." : "Saglabāt izmaiņas"}
          </button>
        </div>
      </div>
    </form>
  );
}

