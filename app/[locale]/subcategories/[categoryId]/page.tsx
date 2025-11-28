import Subcategories from "@/app/components/subcategories";

interface PageProps {
  params: Promise<{
    categoryId: string;
    locale: string;
  }>;
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { categoryId, locale } = await params;

  return <Subcategories categoryId={categoryId} locale={locale} />;
}
