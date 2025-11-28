"use client";

import { useTranslations } from 'next-intl';

export function AdsText() {
  const t = useTranslations('ads');
  return <p className="mt-6 text-zinc-400">{t('noFilters')}</p>;
}

