import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Breadcrumbs from "@/app/lib/breadcrumbs";
import { getCategoryIconConfig } from "@/app/lib/categoryIcon";
import { getAds } from "@/server/categories";
import AdsForm from "@/app/components/ads-form";

interface AdsProps {
  categoryId: string;
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
          <AdsForm filters={filters} categoryId={categoryId} />
        )}
      </div>
    </section>
  );
}
