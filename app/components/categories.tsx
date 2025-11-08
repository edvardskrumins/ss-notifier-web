import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/server/categories";

type Category = {
  id: number;
  title: string;
  url: string;
  type: string;
};

function resolveIconPath(url: string): string | null {
  try {
    const slug = new URL(url)
      .pathname.split("/")
      .filter(Boolean)
      .pop();

    if (!slug) {
      return null;
    }

    return `/images/category-icons/${slug}.svg`;
  } catch {
    return null;
  }
}

export default async function Categories() {
  const categories: Category[] = await getCategories();
  console.log('categories', categories);

  if (!categories?.length) {
    return null;
  }

  return ( 
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-12 sm:px-6 lg:px-8">
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const iconSrc = resolveIconPath(category.url);

            return (
              <Link
                key={category.id}
                href={category.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {iconSrc ? (
                  <Image
                    src={iconSrc}
                    alt={`${category.title} icon`}
                    width={96}
                    height={96}
                    className="mb-4 h-20 w-20 object-contain"
                  />
                ) : (
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                    ?
                  </div>
                )}
                <span className="text-base font-semibold text-gray-900">
                  {category.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}