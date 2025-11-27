"use client";

import { FormEvent, useState } from "react";
import { FilterEntity, FilterValue } from "@/server/categories";
import { apiFetch, extractErrorMessage } from "@/app/lib/apiClient";

interface AdsFormProps {
  filters: FilterEntity[];
  categoryId: string | number;
}

type BoundSelection = {
  value: string;
  filter_value_id: number | null;
};

type RangeValue = {
  from?: BoundSelection;
  to?: BoundSelection;
};

type FilterSelection = {
  filter_id: number;
  label: string;
  value: string | RangeValue;
  filter_value_id?: number | null;
};

function renderFilterField(filter: FilterEntity) {
  const name = filter.form_param ?? `filter_${filter.id}`;

  switch (filter.type) {
    case "custom_range":
      return (
        <div className="mt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <input
              type="number"
              name={`${name}_from`}
              placeholder="Min"
              className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
            <span className="text-center text-zinc-500" aria-hidden="true">
              -
            </span>
            <input
              type="number"
              name={`${name}_to`}
              placeholder="Max"
              className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>
        </div>
      );

    case "custom_text":
      return (
        <input
          type="text"
          name={name}
          maxLength={filter.max_length ?? undefined}
          placeholder={filter.label}
          className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
        />
      );

    case "select":
      return (
        <select
          name={name}
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
          defaultValue=""
        >
          <option value="" disabled>
            Izvēlies opciju
          </option>
          {filter.values.map((option: FilterValue) => (
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
              name={`${name}_from`}
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
              defaultValue=""
            >
              <option value="" disabled>
                Min
              </option>
              {filter.values.map((option: FilterValue) => (
                <option key={`${option.id}-from`} value={option.value}>
                  {option.label ?? option.value}
                </option>
              ))}
            </select>
            <span className="text-zinc-500" aria-hidden="true">
              -
            </span>
            <select
              name={`${name}_to`}
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
              defaultValue=""
            >
              <option value="" disabled>
                Max
              </option>
              {filter.values.map((option: FilterValue) => (
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
}

export default function AdsForm({ filters, categoryId }: AdsFormProps) {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findFilterValue = (
    filter: FilterEntity,
    value: string
  ): FilterValue | undefined => {
    return filter.values.find((option) => option.value === value);
  };

  const pushSingleSelection = (
    selections: FilterSelection[],
    filter: FilterEntity,
    value: string | null
  ) => {
    if (!value || value === "") {
      return;
    }

    let filterValueId: number | null = null;
    if (["select"].includes(filter.type)) {
      filterValueId = findFilterValue(filter, value)?.id ?? null;
    }

    selections.push({
      filter_id: filter.id,
      label: filter.label,
      value,
      filter_value_id: filterValueId,
    });
  };

  const pushRangeSelection = (
    selections: FilterSelection[],
    filter: FilterEntity,
    fromValue: string | null,
    toValue: string | null
  ) => {
    const rangeValue: RangeValue = {};

    if (fromValue && fromValue !== "") {
      const matched = ["select_range"].includes(filter.type)
        ? findFilterValue(filter, fromValue)
        : null;

      rangeValue.from = {
        value: fromValue,
        filter_value_id: matched?.id ?? null,
      };
    }

    if (toValue && toValue !== "") {
      const matched = ["select_range"].includes(filter.type)
        ? findFilterValue(filter, toValue)
        : null;

      rangeValue.to = {
        value: toValue,
        filter_value_id: matched?.id ?? null,
      };
    }

    if (!rangeValue.from && !rangeValue.to) {
      return;
    }

    selections.push({
      filter_id: filter.id,
      label: filter.label,
      value: rangeValue,
    });
  };

  const buildFilterSelections = (
    formData: FormData
  ): FilterSelection[] => {
    const selections: FilterSelection[] = [];

    filters.forEach((filter) => {
      const baseName = filter.form_param ?? `filter_${filter.id}`;

      switch (filter.type) {
        case "custom_range":
        case "select_range": {
          const fromValue = formData.get(`${baseName}_from`);
          const toValue = formData.get(`${baseName}_to`);

          pushRangeSelection(
            selections,
            filter,
            typeof fromValue === "string" ? fromValue : null,
            typeof toValue === "string" ? toValue : null
          );
          break;
        }
        default: {
          const value = formData.get(baseName);
          pushSingleSelection(
            selections,
            filter,
            typeof value === "string" ? value : null
          );
        }
      }
    });

    return selections;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const nameValue = formData.get("name");
    const name =
      typeof nameValue === "string" ? nameValue.trim() : "";

    if (!name) {
      setError("Nosaukums ir obligāts.");
      setPending(false);
      return;
    }

    const filterSelections = buildFilterSelections(formData);

    const payload = {
      name,
      filters: filterSelections,
    };

    // Debug: Log what's being sent
    console.log("Sending payload:", payload);
    console.log("Category ID:", categoryId);

    try {
      const response = await apiFetch(
        `/categories/${categoryId}/start-notifications`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          "Neizdevās saglabāt paziņojumu."
        );
        throw new Error(message);
      }

      setSuccess("Paziņojums veiksmīgi saglabāts.");
      event.currentTarget.reset();
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

  return (
    <form className="mt-8 w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-8 shadow-xl shadow-black/20">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="mx-auto w-full space-y-2 border-b border-zinc-800/70 pb-6 text-left sm:w-[85%] md:w-[75%]">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-100" htmlFor="default_name">
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
              className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          {filters.map((filter: FilterEntity) => (
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
            {pending ? "Saglabāju..." : "Saglabāt"}
          </button>
        </div>
      </div>
    </form>
  );
}

