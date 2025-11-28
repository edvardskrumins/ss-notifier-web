import { Link } from "@/app/lib/navigation";
import { CategoryEntity, getCategories } from "@/server/categories";
import { CATEGORY_TYPE_ADS } from "@/app/lib/constants";
import { getCategoryIconConfig } from "@/app/lib/categoryIcon";
import { getLocale } from 'next-intl/server';

export default async function Categories() {
  // getLocale() should work, but let's ensure it's getting the correct locale
  const locale = await getLocale();
  const categories: CategoryEntity[] = await getCategories(locale);

  if (!categories?.length) {
    return null;
  }

  return (
    <section >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const config = getCategoryIconConfig(category);
            const Icon = config.icon;

            return (
              <Link
                key={category.id}
                href={
                  category.type === CATEGORY_TYPE_ADS
                    ? `/ads/${category.id}`
                    : `/subcategories/${category.id}`
                }
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-xl border border-zinc-800 bg-gradient-to-br ${config.color} to-transparent`}
                  >
                    <Icon className="h-7 w-7 text-zinc-200" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-zinc-100">{category.title}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}