import { CategoryProductsPage } from "@/features/catalog/category-products-page";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CategoryProductsPage slug={slug} />;
}
