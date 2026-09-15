"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/features/cart/cart-context";
import type {
  CatalogCategory,
  CatalogProduct,
  CategoryMenuGroup,
  PagedCatalogProducts,
} from "@/lib/catalog";
import type { CSSProperties } from "react";
import styles from "./category-products-page.module.css";

const groupLabels: Record<CategoryMenuGroup, string> = {
  Solution: "Shop by Solution",
  Room: "Shop by Room",
  Category: "Shop by Category",
};

const groupColors: Record<CategoryMenuGroup, string> = {
  Solution: "#ed267a",
  Room: "#9683b1",
  Category: "#034f4f",
};

function passthroughImageLoader({ src }: ImageLoaderProps) {
  return src;
}

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

function ProductCard({
  category,
  product,
}: {
  category: CatalogCategory;
  product: CatalogProduct;
}) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");
  const feedbackTimerRef = useRef<number | null>(null);
  const imageUrl = product.primaryImage?.url ?? "/images/hero-home.png";
  const isRemoteImage = /^https?:\/\//i.test(imageUrl);
  const isAvailable = product.stock.status !== "OutOfStock";
  const currencyCode = product.price?.currencyCode ?? "TRY";
  const effectivePrice = product.price?.effectivePrice ?? 0;
  const hasDiscount =
    product.price?.campaignPrice !== null &&
    product.price?.campaignPrice !== undefined &&
    product.price.listPrice > product.price.effectivePrice;
  const stockLabel =
    product.stock.status === "OutOfStock"
      ? "Stokta yok"
      : product.stock.status === "LowStock"
        ? `Son ${product.stock.availableQuantity} ürün`
        : "Stokta";

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  async function handleAddToCart() {
    if (!isAvailable || adding) return;

    setAdding(true);
    setAddError("");
    try {
      await addItem({
        id: product.id,
        name: product.name,
        category: category.name,
        price: effectivePrice,
        image: imageUrl,
        color: groupColors[category.menuGroup],
        delivery: "2 gün",
      });
      setAdded(true);
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = window.setTimeout(() => setAdded(false), 1800);
    } catch (reason) {
      setAddError(
        reason instanceof Error ? reason.message : "Ürün sepete eklenemedi.",
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className={styles.productCard}>
      <div className={styles.productImage}>
        <Image
          alt={product.primaryImage?.altText || product.name}
          fill
          loader={isRemoteImage ? passthroughImageLoader : undefined}
          sizes="(max-width: 680px) 100vw, (max-width: 1080px) 50vw, 33vw"
          src={imageUrl}
          unoptimized={isRemoteImage}
        />
        {product.isXtra ? <span>+XTRA</span> : null}
      </div>

      <div className={styles.productInfo}>
        <div className={styles.productTopline}>
          <span>{category.name}</span>
          <small data-stock={product.stock.status}>{stockLabel}</small>
        </div>
        <h2>{product.name}</h2>
        {product.shortDescription ? <p>{product.shortDescription}</p> : null}

        <div className={styles.productBottom}>
          <div className={styles.price}>
            <strong>{formatPrice(effectivePrice, currencyCode)}</strong>
            {hasDiscount && product.price ? (
              <del>{formatPrice(product.price.listPrice, currencyCode)}</del>
            ) : null}
          </div>
          <button
            className={added ? styles.addedButton : ""}
            disabled={!isAvailable || adding}
            onClick={() => void handleAddToCart()}
            type="button"
          >
            {added
              ? "Sepete eklendi ✓"
              : adding
                ? "Ekleniyor…"
                : isAvailable
                  ? "Sepete ekle"
                  : "Stokta yok"}
          </button>
        </div>

        {addError ? (
          <p className={styles.cardError} role="alert">
            {addError}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function CategoryProductsPage({ slug }: { slug: string }) {
  const [category, setCategory] = useState<CatalogCategory | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategoryProducts() {
      setLoading(true);
      setError("");

      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/catalog/categories", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(
            `/api/catalog/products?page=1&pageSize=100&sort=Recommended&category=${encodeURIComponent(slug)}`,
            { cache: "no-store", signal: controller.signal },
          ),
        ]);

        if (!categoryResponse.ok) {
          throw new Error("Kategori bilgileri yüklenemedi.");
        }
        if (!productResponse.ok) {
          throw new Error("Ürünler yüklenemedi.");
        }

        const [categories, productPage] = (await Promise.all([
          categoryResponse.json(),
          productResponse.json(),
        ])) as [CatalogCategory[], PagedCatalogProducts];
        const selectedCategory = categories.find(
          (item) =>
            item.slug.toLocaleLowerCase("tr-TR") ===
            slug.toLocaleLowerCase("tr-TR"),
        );

        if (!selectedCategory) {
          setCategory(null);
          setProducts([]);
          setError("Bu kategori bulunamadı veya yayından kaldırılmış.");
          return;
        }

        setCategory(selectedCategory);
        setProducts(productPage.items);
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          return;
        }
        setCategory(null);
        setProducts([]);
        setError(
          reason instanceof Error
            ? reason.message
            : "Kategori ürünleri yüklenemedi.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCategoryProducts();
    return () => controller.abort();
  }, [slug]);

  const pageStyle = category
    ? ({
        "--category-accent": groupColors[category.menuGroup],
      } as CSSProperties)
    : undefined;

  return (
    <main className={styles.page} style={pageStyle}>
      {loading ? (
        <div className={styles.loading} role="status">
          <span />
          Ürünler yükleniyor…
        </div>
      ) : error ? (
        <section className={styles.message}>
          <h1>Kategori ürünleri</h1>
          <p role="alert">{error}</p>
        </section>
      ) : category ? (
        <section aria-labelledby="category-title" className={styles.catalog}>
          <header className={styles.heading}>
            <div>
              <span>{groupLabels[category.menuGroup]}</span>
              <h1 id="category-title">{category.name}</h1>
            </div>
            <p>{products.length} ürün</p>
          </header>

          {products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard
                  category={category}
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h2>Bu kategoride henüz ürün yok.</h2>
              <p>
                Yönetim panelinden bu kategoriye ürün atandığında burada
                otomatik olarak listelenecek.
              </p>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
