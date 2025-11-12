import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Breadcrumbs from "@/app/lib/breadcrumbs";
import { getCategoryIconConfig } from "@/app/lib/categoryIcon";
import {
  FilterEntity,
  FilterValue,
  getAds,
} from "@/server/categories";

interface AdsProps {
  categoryId: string;
}

function renderFilterField(filter: FilterEntity) {
  const name = filter.form_param ?? `filter_${filter.id}`;

  switch (filter.type) {
    case "custom_range":
      return (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            name={`${name}_from`}
            placeholder="Min"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
          <input
            type="number"
            name={`${name}_to`}
            placeholder="Max"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
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
          className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            Select an option
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
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <select
            name={`${name}_from`}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
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
          <select
            name={`${name}_to`}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
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
      );

    default:
      return null;
  }
}

export default async function Ads({ categoryId }: AdsProps) {
  const { filters, breadcrumbs, category } = await getAds(categoryId);

  const parentCrumb = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;
  const backHref = parentCrumb ? `/subcategories/${parentCrumb.id}` : "/";
  const categoryConfig = category ? getCategoryIconConfig(category) : null;

  return (
    <section >
      <div className="mx-auto max-w-6xl px-4">

      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="flex items-center gap-3 ">
          <Link href={backHref} className="rounded-xl border border-zinc-800 p-2 bg-zinc-900/70 hover:bg-zinc-900">
            <ChevronLeft className="h-5 w-5 text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">{category?.title ?? "Subcategories"}</h1>
          </div>
          {categoryConfig && (
            <div
              className={` grid h-12 w-12 place-items-center rounded-xl border border-zinc-800 bg-gradient-to-br ${categoryConfig.color} to-transparent`}
            >
              <categoryConfig.icon className="h-6 w-6 text-zinc-200" />
            </div>
          )}
        </div>

        {filters.length === 0 ? (
          <p className="mt-6 text-zinc-400">No filters found for this category.</p>
        ) : (
          <form className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filters.map((filter: FilterEntity) => (
                <fieldset
                  key={filter.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-sm"
                >
                  <div className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                    {filter.label}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">
                    {filter.type}
                  </div>
                  {filter.form_param && (
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-zinc-600">
                      param: {filter.form_param}
                    </div>
                  )}

                  {renderFilterField(filter)}
                </fieldset>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-blue-500 px-6 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Apply Filters
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
