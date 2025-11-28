import Ads from "@/app/components/ads";

interface PageProps {
  params: Promise<{
    categoryId: string;
    locale: string;
  }>;
}

export default async function AdsPage({ params }: PageProps) {
  const { categoryId, locale } = await params;

  return <Ads categoryId={categoryId} locale={locale} />;
}
