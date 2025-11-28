"use server";

import { apiFetch } from "@/app/lib/apiClient";

export type CategoryEntity = {
  id: number;
  title: string;
  url: string | null;
  type: string;
  breadcrumbs?: Breadcrumb[];
};

export type Breadcrumb = {
  id: number;
  title: string;
};

export type FilterValue = {
  id: number;
  label: string;
  value: string;
};

export type FilterEntity = {
  id: number;
  label: string;
  type: string;
  max_length: number | null;
  form_param: string | null;
  values: FilterValue[];
};

export type SubcategoryPayload = {
  items: CategoryEntity[];
  breadcrumbs: Breadcrumb[];
  category: CategoryEntity | null;
};

export type AdsPayload = {
  filters: FilterEntity[];
  breadcrumbs: Breadcrumb[];
  category: CategoryEntity | null;
};

export async function getCategories(locale: string = 'lv'): Promise<CategoryEntity[]> {
  const response = await apiFetch(`/categories?locale=${locale}`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const json = await response.json();
  return (json.data as CategoryEntity[]) ?? [];
}

export async function getSubcategories(
  categoryId: number | string,
  locale: string = 'lv'
): Promise<SubcategoryPayload> {
  const response = await apiFetch(`/categories/${categoryId}/subcategories?locale=${locale}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch subcategories");
  }

  const json = await response.json();

  const rawCategory = json.meta?.category;
  const categoryData = rawCategory?.data ?? rawCategory ?? null;

  return {
    items: (json.data as CategoryEntity[]) ?? [],
    breadcrumbs: (json.meta?.breadcrumbs as Breadcrumb[]) ?? [],
    category: categoryData as CategoryEntity | null,
  };
}

export async function getAds(categoryId: number | string, locale: string = 'lv'): Promise<AdsPayload> {
  const response = await apiFetch(`/categories/${categoryId}/ads?locale=${locale}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ads data");
  }

  const json = await response.json();

  const rawCategory = json.meta?.category;
  const categoryData = rawCategory?.data ?? rawCategory ?? null;

  return {
    filters: (json.data as FilterEntity[]) ?? [],
    breadcrumbs: (json.meta?.breadcrumbs as Breadcrumb[]) ?? [],
    category: categoryData as CategoryEntity | null,
  };
}