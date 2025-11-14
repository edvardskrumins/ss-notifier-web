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
          className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
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
        <div className="mt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <select
              name={`${name}_from`}
              className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
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
              className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-600 focus:outline-none"
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

export default async function Ads({ categoryId }: AdsProps) {
  const { filters, breadcrumbs, category } = await getAds(categoryId);

  const parentCrumb = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;
  const backHref = parentCrumb ? `/subcategories/${parentCrumb.id}` : "/";
  const categoryConfig = category ? getCategoryIconConfig(category) : null;

  return (
    <section >
      <div className="mx-auto max-w-6xl px-4 pb-20">

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
                      <div className="text-sm font-semibold text-zinc-100">{filter.label}</div>
                    </div>
                    {renderFilterField(filter)}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex w-full justify-center sm:w-[85%] md:w-[75%]">
                <button
                  type="submit"
                  className="mt-8 rounded-xl border border-purple-400/70 bg-zinc-900/80 px-6 py-2 text-sm font-semibold text-white shadow transition hover:border-purple-300 hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Saglabāt 
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
