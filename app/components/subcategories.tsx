import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/app/lib/breadcrumbs";
import { CATEGORY_TYPE_ADS } from "@/app/lib/constants";
import { getCategoryIconConfig } from "@/app/lib/categoryIcon";
import {
  CategoryEntity,
  getSubcategories,
  SubcategoryPayload,
} from "@/server/categories";

type Props = {
  categoryId: string;
};

export default async function Subcategories({ categoryId }: Props) {
  const { items, breadcrumbs, category }: SubcategoryPayload =
    await getSubcategories(categoryId);

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

        {items.length === 0 ? (
          <p className="mt-6 ">No subcategories found.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((subcategory: CategoryEntity) => (
              <Link
                key={subcategory.id}
                href={
                  subcategory.type === CATEGORY_TYPE_ADS
                    ? `/ads/${subcategory.id}`
                    : `/subcategories/${subcategory.id}`
                }
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-semibold text-zinc-100">
                    {subcategory.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:text-zinc-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}