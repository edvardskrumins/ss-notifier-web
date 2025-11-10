import Ads from "@/app/components/ads";

interface PageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function AdsPage({ params }: PageProps) {
  const { categoryId } = await params;

  return <Ads categoryId={categoryId} />;
}
