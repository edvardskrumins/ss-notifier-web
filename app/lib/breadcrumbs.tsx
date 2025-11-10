import Link from "next/link";
import type { Breadcrumb } from "@/server/categories";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

export default function Breadcrumbs({ breadcrumbs, className }: BreadcrumbsProps) {
  if (!breadcrumbs?.length) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={className ?? "mb-6 text-sm "}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={`${crumb.id}-${index}`} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium ">{crumb.title}</span>
              ) : (
                <Link
                  href={`/subcategories/${crumb.id}`}
                  className="hover:text-blue-600 hover:underline"
                >
                  {crumb.title}
                </Link>
              )}
              {!isLast && <ChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:text-zinc-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
