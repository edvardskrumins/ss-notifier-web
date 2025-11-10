import {
  Baby,
  BriefcaseBusiness,
  Car,
  Factory,
  Flame,
  Home,
  Monitor,
  PawPrint,
  Shirt,
  Sofa,
  Sun,
  Tractor,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { CategoryEntity } from "@/server/categories";

const DEFAULT_ICON: LucideIcon = Flame;

const CATEGORY_ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  "work": { icon: BriefcaseBusiness, color: "from-emerald-500/20" },
  "production-work": { icon: Factory, color: "from-orange-500/20" },
  "transport": { icon: Car, color: "from-blue-500/20" },
  "real-estate": { icon: Home, color: "from-violet-500/20" },
  "construction": { icon: Wrench, color: "from-amber-500/20" },
  "electronics": { icon: Monitor, color: "from-fuchsia-500/20" },
  "clothes-footwear": { icon: Shirt, color: "from-rose-500/20" },
  "home-stuff": { icon: Sofa, color: "from-sky-500/20" },
  "for-children": { icon: Baby, color: "from-pink-500/20" },
  "animals": { icon: PawPrint, color: "from-lime-500/20" },
  "agriculture": { icon: Tractor, color: "from-green-500/20" },
  "entertainment": { icon: Sun, color: "from-yellow-500/20" },
};

export function getCategorySlug(category: CategoryEntity): string | null {
  if (!category.url) {
    return null;
  }

  try {
    const url = new URL(category.url);
    const segments = url.pathname.split("/").filter(Boolean);

    const lvIndex = segments.indexOf("lv");
    if (lvIndex !== -1 && segments[lvIndex + 1]) {
      return segments[lvIndex + 1].toLowerCase();
    }

    const last = segments.at(-1);
    return last ? last.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function getCategoryIconConfig(category: CategoryEntity) {
  const slug = getCategorySlug(category);

  if (slug && CATEGORY_ICON_MAP[slug]) {
    return CATEGORY_ICON_MAP[slug];
  }

  return { icon: DEFAULT_ICON, color: "from-zinc-500/20" };
}
