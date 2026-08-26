"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/features/cart/cart-context";
import type {
  BackendFavoriteItem,
  BackendPagedFavorites,
  FavoriteApiError,
} from "@/lib/favorites";
import { AccountNavigation } from "./account-navigation";
import styles from "./favorites-page.module.css";

type FavoriteProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  stock: "Stokta" | "Son 3 ürün" | "Yakında";
  delivery: string;
  image: string;
  color: string;
  reason?: string;
};

type SelectOption = {
  label: string;
  value: string;
};

const initialFavorites: FavoriteProduct[] = [
  {
    id: "05527362-1d91-4b47-a598-bf334c4996bb",
    name: "+XTRA Sakin Aroma",
    category: "Aroma",
    price: 349,
    rating: 4.8,
    reviews: 126,
    stock: "Stokta",
    delivery: "2 gün",
    image: "/images/hero-home.png",
    color: "#5b613d",
  },
  {
    id: "3310ead5-3459-43a7-982f-6446cc5af664",
    name: "+XTRA One Konfor Yastığı",
    category: "Uyku",
    price: 999,
    rating: 4.9,
    reviews: 214,
    stock: "Stokta",
    delivery: "1 gün",
    image: "/images/hero-sleep.png",
    color: "#9683b1",
  },
  {
    id: "8529ea32-50b0-476f-aeb0-8656aa5b0d3f",
    name: "Lavanta Tekstil Spreyi",
    category: "Ev Tekstili",
    price: 279,
    rating: 4.8,
    reviews: 156,
    stock: "Stokta",
    delivery: "2 gün",
    image: "/images/hero-living.png",
    color: "#bf5d30",
  },
  {
    id: "cf6d1497-6c1f-4997-84ae-713410eed466",
    name: "Limon Bulaşık Deterjanı",
    category: "Mutfak",
    price: 189,
    rating: 4.6,
    reviews: 74,
    stock: "Son 3 ürün",
    delivery: "1 gün",
    image: "/images/hero-home.png",
    color: "#cf902a",
  },
  {
    id: "6170d843-e8b7-4a6e-943f-d0c5fc6b69c3",
    name: "Yumuşak Dokulu Havlu Seti",
    category: "Banyo",
    price: 699,
    rating: 4.9,
    reviews: 98,
    stock: "Stokta",
    delivery: "2 gün",
    image: "/images/hero-living.png",
    color: "#034f4f",
  },
  {
    id: "0439679f-f073-4663-81d8-b96a395e40ab",
    name: "Evcil Dostlar Bakım Seti",
    category: "Evcil Dostlar",
    price: 429,
    rating: 4.5,
    reviews: 42,
    stock: "Yakında",
    delivery: "Stok yenilenince",
    image: "/images/module-sprite.png",
    color: "#bf5d30",
  },
];

const initialRecommendations: FavoriteProduct[] = [
  {
    id: "05527362-1d91-4b47-a598-bf334c4996bb",
    name: "+XTRA Sakin Aroma",
    category: "Aroma",
    price: 349,
    rating: 4.8,
    reviews: 126,
    stock: "Stokta",
    delivery: "2 gün",
    image: "/images/hero-living.png",
    color: "#5b613d",
    reason: "Aroma favorilerinize benzer",
  },
  {
    id: "8529ea32-50b0-476f-aeb0-8656aa5b0d3f",
    name: "Lavanta Tekstil Spreyi",
    category: "Ev Tekstili",
    price: 279,
    rating: 4.8,
    reviews: 156,
    stock: "Stokta",
    delivery: "2 gün",
    image: "/images/hero-home.png",
    color: "#bf5d30",
    reason: "Ev tekstili seçimlerinizi tamamlar",
  },
  {
    id: "cf6d1497-6c1f-4997-84ae-713410eed466",
    name: "Limon Bulaşık Deterjanı",
    category: "Mutfak",
    price: 189,
    rating: 4.6,
    reviews: 51,
    stock: "Stokta",
    delivery: "1 gün",
    image: "/images/hero-home.png",
    color: "#cf902a",
    reason: "Mutfak ilginize göre",
  },
];

const categoryColors: Record<string, string> = {
  Aroma: "#5b613d",
  Uyku: "#9683b1",
  "Ev Tekstili": "#bf5d30",
  Mutfak: "#cf902a",
  Banyo: "#034f4f",
  "Evcil Dostlar": "#bf5d30",
};

function mapFavoriteItem(item: BackendFavoriteItem): FavoriteProduct {
  const product = item.product;
  const presentation = initialFavorites.find(
    (candidate) => candidate.id === product.id,
  );
  const category = product.categories[0]?.name ?? "Sofistike";
  const stock =
    product.stock.status === "OutOfStock"
      ? "Yakında"
      : product.stock.status === "LowStock"
        ? "Son 3 ürün"
        : "Stokta";

  return {
    id: product.id,
    name: product.name,
    category,
    price: product.price?.effectivePrice ?? 0,
    rating: presentation?.rating ?? 0,
    reviews: presentation?.reviews ?? 0,
    stock,
    delivery: presentation?.delivery ?? "2 gün",
    image:
      product.primaryImage?.url ??
      presentation?.image ??
      "/images/hero-home.png",
    color: categoryColors[category] ?? "#7540c2",
  };
}

async function readApiError(response: Response) {
  const payload = (await response
    .json()
    .catch(() => null)) as FavoriteApiError | null;
  return payload?.message ?? "İşlem şu anda tamamlanamadı.";
}

function HeartIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function FilterMenu({
  label,
  options,
  value,
  open,
  onOpen,
  onChange,
}: {
  label: string;
  options: SelectOption[];
  value: string;
  open: boolean;
  onOpen: () => void;
  onChange: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={styles.filterMenu}>
      <button
        type="button"
        className={styles.filterTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onOpen}
      >
        <span>{selectedOption?.label}</span>
        <span className={styles.filterChevron} aria-hidden="true">
          ⌄
        </span>
      </button>

      {open ? (
        <div className={styles.filterOptions} role="listbox" aria-label={label}>
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={selected ? styles.selectedOption : undefined}
                key={option.value}
                onClick={() => onChange(option.value)}
              >
                <span>{option.label}</span>
                {selected ? <span aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FavoriteCard({
  product,
  onRemove,
}: {
  product: FavoriteProduct;
  onRemove: (product: FavoriteProduct) => Promise<void>;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <article
      className={styles.favoriteCard}
      style={{ "--accent": product.color } as React.CSSProperties}
    >
      <div className={styles.productImage}>
        <Image
          src={product.image}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
        />
        <button
          type="button"
          className={styles.heartButton}
          aria-label={`${product.name} favorilerden kaldır`}
          onClick={() => void onRemove(product)}
        >
          <HeartIcon />
        </button>
      </div>
      <div className={styles.productInfo}>
        <span className={styles.category}>{product.category}</span>
        <h3>{product.name}</h3>
        <div
          className={styles.rating}
          aria-label={`${product.rating} puan, ${product.reviews} yorum`}
        >
          <span aria-hidden="true">★</span>
          <strong>{product.rating.toLocaleString("tr-TR")}</strong>
          <small>({product.reviews} yorum)</small>
        </div>
        <span className={styles.stock}>{product.stock}</span>
        <strong className={styles.price}>₺{product.price}</strong>
        <small className={styles.delivery}>
          Tahmini kargoya teslim: {product.delivery}
        </small>
        <button
          type="button"
          className={styles.cartButton}
          disabled={product.stock === "Yakında"}
          onClick={async () => {
            if (product.stock === "Yakında") return;
            try {
              await addItem({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                image: product.image,
                color: product.color,
                delivery: product.delivery,
              });
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1800);
            } catch {
              // Sepet sağlayıcısı kullanıcıya gösterilecek hatayı yönetir.
            }
          }}
        >
          {added
            ? "Sepete eklendi ✓"
            : product.stock === "Yakında"
              ? "Yakında"
              : "Sepete Ekle"}
        </button>
      </div>
    </article>
  );
}

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [recommendations, setRecommendations] = useState(
    initialRecommendations,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [sort, setSort] = useState("recent");
  const [openFilter, setOpenFilter] = useState<"category" | "sort" | null>(
    null,
  );
  const [removedProduct, setRemovedProduct] = useState<FavoriteProduct | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<number | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          "/api/account/favorites?page=1&pageSize=100",
          { cache: "no-store" },
        );
        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }
        if (!response.ok) {
          throw new Error(await readApiError(response));
        }

        const payload = (await response.json()) as BackendPagedFavorites;
        if (cancelled) return;
        const loadedFavorites = payload.items.map(mapFavoriteItem);
        const favoriteIds = new Set(
          loadedFavorites.map((product) => product.id),
        );
        setFavorites(loadedFavorites);
        setRecommendations(
          initialRecommendations.filter(
            (product) => !favoriteIds.has(product.id),
          ),
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Favorileriniz yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [reloadVersion]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current !== null)
        window.clearTimeout(noticeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!openFilter) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!controlsRef.current?.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenFilter(null);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openFilter]);

  const categories = useMemo(
    () => ["Tümü", ...new Set(favorites.map((product) => product.category))],
    [favorites],
  );

  const categoryOptions = categories.map((item) => ({
    label: `Kategori: ${item}`,
    value: item,
  }));
  const sortOptions: SelectOption[] = [
    { label: "Son eklenenler", value: "recent" },
    { label: "Fiyat: Artan", value: "price-asc" },
    { label: "Fiyat: Azalan", value: "price-desc" },
  ];

  const visibleFavorites = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const products = favorites.filter(
      (product) =>
        (category === "Tümü" || product.category === category) &&
        (!normalizedQuery ||
          `${product.name} ${product.category}`
            .toLocaleLowerCase("tr-TR")
            .includes(normalizedQuery)),
    );

    if (sort === "price-asc")
      return [...products].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      return [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [category, favorites, query, sort]);

  function showNotice(message: string) {
    setNotice(message);
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => {
      setNotice("");
      setRemovedProduct(null);
    }, 3000);
  }

  async function removeFavorite(product: FavoriteProduct) {
    setFavorites((current) => current.filter((item) => item.id !== product.id));
    setRemovedProduct(product);
    try {
      const response = await fetch(`/api/account/favorites/${product.id}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response));
      showNotice(`${product.name} favorilerinizden kaldırıldı.`);
    } catch (error) {
      setFavorites((current) => [product, ...current]);
      setRemovedProduct(null);
      showNotice(
        error instanceof Error
          ? error.message
          : "Ürün favorilerden kaldırılamadı.",
      );
    }
  }

  async function undoRemove() {
    if (!removedProduct) return;
    try {
      const response = await fetch(
        `/api/account/favorites/${removedProduct.id}`,
        { method: "POST" },
      );
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response));
      const favorite = mapFavoriteItem(
        (await response.json()) as BackendFavoriteItem,
      );
      setFavorites((current) => [favorite, ...current]);
      setRemovedProduct(null);
      setNotice("");
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Favori geri alınamadı.",
      );
    }
  }

  async function addRecommendation(product: FavoriteProduct) {
    setRemovedProduct(null);
    try {
      const response = await fetch(`/api/account/favorites/${product.id}`, {
        method: "POST",
      });
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response));
      const favorite = mapFavoriteItem(
        (await response.json()) as BackendFavoriteItem,
      );
      setFavorites((current) => [
        favorite,
        ...current.filter((item) => item.id !== favorite.id),
      ]);
      setRecommendations((current) =>
        current.filter((item) => item.id !== product.id),
      );
      showNotice(`${favorite.name} favorilerinize eklendi.`);
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Ürün favorilere eklenemedi.",
      );
    }
  }

  return (
    <main className={styles.favoritesPage}>
      <div className={styles.colorGlow} aria-hidden="true" />
      <header className={styles.pageIntro}>
        <p>SOFISTIKE +XTRA HESAP</p>
        <div>
          <h1>Favorilerim</h1>
          <span>{favorites.length} favori ürün</span>
        </div>
        <small>Beğendiğiniz ürünleri burada bir arada görüntüleyin.</small>
      </header>

      <div className={styles.accountLayout}>
        <AccountNavigation active="favorites" />

        <div className={styles.contentColumn}>
          <section
            className={styles.favoritesPanel}
            aria-labelledby="favorites-title"
          >
            <div className={styles.panelHeader}>
              <div>
                <p>FAVORİ SEÇKİNİZ</p>
                <h2 id="favorites-title">Favorilerinize hızlıca ulaşın.</h2>
              </div>
              <span>Güncel favoriler</span>
            </div>

            <div className={styles.controls} ref={controlsRef}>
              <label className={styles.searchField}>
                <span className={styles.srOnly}>Favorilerimde ara</span>
                <SearchIcon />
                <input
                  type="search"
                  value={query}
                  placeholder="Favorilerimde ara"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <FilterMenu
                label="Kategori"
                options={categoryOptions}
                value={category}
                open={openFilter === "category"}
                onOpen={() =>
                  setOpenFilter((current) =>
                    current === "category" ? null : "category",
                  )
                }
                onChange={(value) => {
                  setCategory(value);
                  setOpenFilter(null);
                }}
              />
              <FilterMenu
                label="Sıralama"
                options={sortOptions}
                value={sort}
                open={openFilter === "sort"}
                onOpen={() =>
                  setOpenFilter((current) =>
                    current === "sort" ? null : "sort",
                  )
                }
                onChange={(value) => {
                  setSort(value);
                  setOpenFilter(null);
                }}
              />
            </div>

            {loading ? (
              <div className={styles.noResults} role="status">
                <h3>Favorileriniz yükleniyor…</h3>
              </div>
            ) : loadError ? (
              <div className={styles.noResults} role="alert">
                <h3>{loadError}</h3>
                <button
                  type="button"
                  onClick={() => setReloadVersion((current) => current + 1)}
                >
                  Tekrar Dene
                </button>
              </div>
            ) : favorites.length === 0 ? (
              <div className={styles.emptyState}>
                <span aria-hidden="true">
                  <HeartIcon filled={false} />
                </span>
                <h3>Henüz favori ürününüz yok.</h3>
                <p>
                  Beğendiğiniz ürünlerdeki kalp ikonuna dokunarak onları burada
                  biriktirebilirsiniz.
                </p>
                <Link href="/#tum-urunler">Ürünleri İncele</Link>
              </div>
            ) : visibleFavorites.length === 0 ? (
              <div className={styles.noResults}>
                <h3>Aramanızla eşleşen favori ürün bulunamadı.</h3>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("Tümü");
                  }}
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {visibleFavorites.map((product) => (
                  <FavoriteCard
                    key={product.id}
                    product={product}
                    onRemove={removeFavorite}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            className={styles.recommendations}
            aria-labelledby="recommendations-title"
          >
            <div className={styles.recommendationHeader}>
              <p>FAVORİLERİNİZDEN İLHAMLA</p>
              <h2 id="recommendations-title">Bunlar da ilginizi çekebilir.</h2>
              <span>
                Favorilerinizdeki ürünlere benzer Sofistike seçkileri.
              </span>
            </div>
            {recommendations.length ? (
              <div className={styles.recommendationGrid}>
                {recommendations.map((product) => (
                  <article
                    className={styles.recommendationCard}
                    key={product.id}
                  >
                    <div className={styles.recommendationImage}>
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                    <div>
                      <span>{product.reason}</span>
                      <h3>{product.name}</h3>
                      <strong>₺{product.price}</strong>
                      <button
                        type="button"
                        onClick={() => void addRecommendation(product)}
                      >
                        <HeartIcon filled={false} /> Favorilere Ekle
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.allAdded}>
                Tüm öneriler favorilerinize eklendi ✓
              </p>
            )}
          </section>
        </div>
      </div>

      {notice ? (
        <div className={styles.notice} role="status">
          <span>{notice}</span>
          {removedProduct ? (
            <button type="button" onClick={() => void undoRemove()}>
              Geri Al
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
