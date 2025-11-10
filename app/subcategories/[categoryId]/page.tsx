import Subcategories from "@/app/components/subcategories";

interface PageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { categoryId } = await params;

  return <Subcategories categoryId={categoryId} />;
}
