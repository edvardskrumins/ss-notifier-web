"use client";

import { useTranslations } from 'next-intl';

export function SubcategoriesText() {
  const t = useTranslations('ads');
  return <p className="mt-6">{t('noSubcategories')}</p>;
}

