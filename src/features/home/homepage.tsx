"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/features/cart/cart-context";
import type { HomeBanner } from "@/lib/banners";
import type {
  CatalogCategory,
  CategoryMenuGroup,
  CatalogProduct,
  PagedCatalogProducts,
} from "@/lib/catalog";
import type { BackendPagedFavorites } from "@/lib/favorites";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import styles from "./homepage.module.css";

type ModuleItem = {
  name: string;
  color: string;
  x: number;
  y: number;
};

type ProductItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  priceValue?: number;
  rating: number;
  reviewCount: number;
  delivery: string;
  stock: "Stokta" | "Son 3 ürün" | "Yakında";
  badge?: string;
  image: string;
  color: string;
  isPopular?: boolean;
  isXtra?: boolean;
};

function toCartProduct(product: ProductItem) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price:
      product.priceValue ?? Number(product.price.replaceAll(/[^0-9]/g, "")),
    image: product.image,
    color: product.color,
    delivery: product.delivery,
  };
}

type HeroSlide = Pick<
  HomeBanner,
  | "id"
  | "imageUrl"
  | "altText"
  | "title"
  | "description"
  | "buttonText"
  | "linkUrl"
>;

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: "fallback-manifesto",
    imageUrl: "/images/sofistike-manifesto-hero.webp",
    altText: "Sofistike +XTRA — Smart Ideas. Better Living marka manifestosu",
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  },
  {
    id: "fallback-living",
    imageUrl: "/images/hero-living.png",
    altText: "Sofistike +XTRA ev yaşam ürünleri koleksiyonu",
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  },
  {
    id: "fallback-home",
    imageUrl: "/images/hero-home.png",
    altText: "Sofistike +XTRA aroma ve ev tekstili ürünleri",
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  },
  {
    id: "fallback-sleep",
    imageUrl: "/images/hero-sleep.png",
    altText: "Sofistike +XTRA uyku çözümleri",
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  },
];

function passthroughImageLoader({ src }: ImageLoaderProps) {
  return src;
}

const brandPalette = {
  terracotta: "#bf5d30",
  lavender: "#9683b1",
  olive: "#5b613d",
  ochre: "#cf902a",
  softPurple: "#a68acb",
  midnight: "#091724",
  sand: "#e5d3bd",
  deepTeal: "#034f4f",
  mistMint: "#9fbeb6",
} as const;

const modules: ModuleItem[] = [
  { name: "Uyku", color: brandPalette.softPurple, x: 2.87, y: 11.37 },
  { name: "Ev Tekstili", color: brandPalette.terracotta, x: 34.51, y: 11.37 },
  { name: "Aroma", color: brandPalette.olive, x: 66.09, y: 11.37 },
  { name: "Mutfak", color: brandPalette.ochre, x: 2.87, y: 40.59 },
  { name: "Banyo", color: brandPalette.deepTeal, x: 34.51, y: 40.59 },
  { name: "Çamaşır", color: brandPalette.mistMint, x: 66.09, y: 40.59 },
  { name: "Dekorasyon", color: brandPalette.ochre, x: 2.87, y: 69.5 },
  { name: "Evcil Dostlar", color: brandPalette.terracotta, x: 34.51, y: 69.5 },
  { name: "İnovasyon Lab", color: brandPalette.midnight, x: 66.09, y: 69.5 },
];

const fallbackFeaturedProducts: ProductItem[] = [
  {
    id: "05527362-1d91-4b47-a598-bf334c4996bb",
    name: "+XTRA Sakin Aroma",
    category: "Aroma",
    description: "Lavanta ve amber notalarıyla evin havasını yumuşatır.",
    price: "₺349",
    rating: 4.8,
    reviewCount: 126,
    delivery: "2 gün",
    stock: "Stokta",
    badge: "Review Lab",
    image: "/images/hero-home.png",
    color: brandPalette.olive,
  },
  {
    id: "8529ea32-50b0-476f-aeb0-8656aa5b0d3f",
    name: "Lavanta Tekstil Spreyi",
    category: "Ev Tekstili",
    description: "Kullanıcı yorumlarıyla geliştirilen uzun süreli ferahlık.",
    price: "₺279",
    rating: 4.8,
    reviewCount: 156,
    delivery: "2 gün",
    stock: "Stokta",
    image: "/images/hero-home.png",
    color: brandPalette.terracotta,
  },
  {
    id: "cf6d1497-6c1f-4997-84ae-713410eed466",
    name: "Bulaşık Deterjanı Limon",
    category: "Mutfak",
    description: "Günlük mutfak düzeni için canlı limon ferahlığı.",
    price: "₺189",
    rating: 4.6,
    reviewCount: 74,
    delivery: "2 gün",
    stock: "Stokta",
    image: "/images/hero-home.png",
    color: brandPalette.ochre,
  },
];

const fallbackLabProducts: ProductItem[] = [
  {
    id: "3310ead5-3459-43a7-982f-6446cc5af664",
    name: "+XTRA One Konfor Yastığı",
    category: "Uyku",
    description: "Ayarlanabilir dolgu ile kişiselleştirilen uyku konforu.",
    price: "₺999",
    rating: 4.9,
    reviewCount: 214,
    delivery: "1 gün",
    stock: "Stokta",
    badge: "En çok dinlenen",
    image: "/images/hero-sleep.png",
    color: brandPalette.softPurple,
  },
  {
    id: "8529ea32-50b0-476f-aeb0-8656aa5b0d3f",
    name: "Lavanta Tekstil Spreyi",
    category: "Ev Tekstili",
    description: "Kullanıcı yorumlarıyla geliştirilen uzun süreli ferahlık.",
    price: "₺279",
    rating: 4.8,
    reviewCount: 156,
    delivery: "2 gün",
    stock: "Stokta",
    badge: "Yeni",
    image: "/images/hero-home.png",
    color: brandPalette.terracotta,
  },
  {
    id: "05527362-1d91-4b47-a598-bf334c4996bb",
    name: "+XTRA Sakin Aroma",
    category: "Aroma",
    description: "Dengeli koku yoğunluğu ve daha yalın bir ev deneyimi.",
    price: "₺349",
    rating: 4.7,
    reviewCount: 126,
    delivery: "2 gün",
    stock: "Son 3 ürün",
    badge: "Review Lab",
    image: "/images/hero-living.png",
    color: brandPalette.olive,
  },
  {
    id: "cf6d1497-6c1f-4997-84ae-713410eed466",
    name: "Limon Bulaşık Deterjanı",
    category: "Mutfak",
    description: "Kolay durulanan formül ve canlı limon ferahlığı.",
    price: "₺189",
    rating: 4.6,
    reviewCount: 74,
    delivery: "1 gün",
    stock: "Stokta",
    image: "/images/hero-home.png",
    color: brandPalette.ochre,
  },
  {
    id: "6170d843-e8b7-4a6e-943f-d0c5fc6b69c3",
    name: "Yumuşak Dokulu Havlu Seti",
    category: "Banyo",
    description: "Emicilik ve dokunma hissi kullanıcı notlarıyla yenilendi.",
    price: "₺699",
    rating: 4.9,
    reviewCount: 98,
    delivery: "2 gün",
    stock: "Stokta",
    image: "/images/hero-living.png",
    color: brandPalette.deepTeal,
  },
  {
    id: "0439679f-f073-4663-81d8-b96a395e40ab",
    name: "Evcil Dostlar Bakım Seti",
    category: "Evcil Dostlar",
    description: "Günlük bakım için sade, güvenli ve pratik çözümler.",
    price: "₺429",
    rating: 4.5,
    reviewCount: 42,
    delivery: "Stok yenilenince",
    stock: "Yakında",
    image: "/images/module-sprite.png",
    color: brandPalette.terracotta,
  },
];

const categoryColors: Record<string, string> = {
  Aroma: brandPalette.olive,
  Uyku: brandPalette.softPurple,
  "Ev Tekstili": brandPalette.terracotta,
  Mutfak: brandPalette.ochre,
  Banyo: brandPalette.deepTeal,
  Çamaşır: brandPalette.mistMint,
  Dekorasyon: brandPalette.ochre,
  "Evcil Dostlar": brandPalette.terracotta,
};

function mapCatalogProduct(product: CatalogProduct): ProductItem {
  const category = product.categories[0]?.name ?? "Sofistike";
  const priceValue = product.price?.effectivePrice ?? 0;
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
    description: product.shortDescription,
    price: new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: product.price?.currencyCode ?? "TRY",
      maximumFractionDigits: 2,
    }).format(priceValue),
    priceValue,
    rating: 0,
    reviewCount: 0,
    delivery: stock === "Yakında" ? "Stok yenilenince" : "2 gün",
    stock,
    badge: product.isXtra ? "+XTRA" : undefined,
    image: product.primaryImage?.url ?? "/images/hero-home.png",
    color: categoryColors[category] ?? brandPalette.midnight,
    isPopular: product.isPopular,
    isXtra: product.isXtra,
  };
}

const domesticMarketplaces = [
  "Amazon Türkiye",
  "n11",
  "Hepsiburada",
  "Trendyol",
  "ÇiçekSepeti",
  "FLO",
  "Pazarama",
  "Sefamerve",
  "Modanisa",
  "Hepsiexpress",
  "Trendyol Go",
  "Beymen.com",
  "Boyner",
  "GetirÇarşı",
  "Koçtaş",
  "LC Waikiki",
];

const globalMarketplaces = [
  "Temu",
  "Amazon Europe",
  "Etsy",
  "AliExpress",
  "Hepsiglobal",
  "Fruugo",
  "eMAG",
];

type ShopGroup = {
  menuGroup: CategoryMenuGroup;
  title: string;
  links: Array<[icon: string, name: string, slug: string]>;
};

const fallbackShopGroups: ShopGroup[] = [
  {
    menuGroup: "Solution",
    title: "SHOP BY SOLUTIONS",
    links: [
      ["☾", "Sleep Better", "sleep-better"],
      ["⌁", "Allergy Care", "allergy-care"],
      ["⌂", "Home Reset", "home-reset"],
      ["♧", "Laundry Care", "laundry-care"],
      ["♨", "Bathroom Care", "bathroom-care"],
      ["▣", "Kitchen Care", "kitchen-care"],
      ["♧", "Pet Friendly", "pet-friendly"],
      ["♡", "Healthy Living", "healthy-living"],
      ["▤", "Organization", "organization"],
      ["◉", "Innovation Lab", "innovation-lab"],
    ],
  },
  {
    menuGroup: "Room",
    title: "SHOP BY ROOM",
    links: [
      ["▱", "Bedroom", "bedroom"],
      ["♨", "Bathroom", "bathroom"],
      ["▤", "Living Room", "living-room"],
      ["▦", "Kitchen", "kitchen-room"],
      ["▣", "Laundry Room", "laundry-room"],
      ["♧", "Kids Room", "kids-room"],
      ["▯", "Guest Room", "guest-room"],
      ["♧", "Pet Area", "pet-area"],
      ["▢", "Travel", "travel"],
    ],
  },
  {
    menuGroup: "Category",
    title: "SHOP BY CATEGORY",
    links: [
      ["▤", "Bedding", "bedding"],
      ["▥", "Bath", "bath"],
      ["⌇", "Home Fragrance", "home-fragrance"],
      ["▣", "Laundry", "laundry"],
      ["⌁", "Cleaning", "cleaning"],
      ["▢", "Kitchen", "kitchen"],
      ["▯", "Personal Care", "personal-care"],
      ["▤", "Storage & Organization", "storage-organization"],
      ["♧", "Pet Care", "pet-care"],
      ["⌁", "Accessories", "accessories"],
      ["♧", "Gifts", "gifts"],
    ],
  },
];

const shopGroupDefinitions: Array<
  Pick<ShopGroup, "menuGroup" | "title"> & { icon: string }
> = [
  { menuGroup: "Solution", title: "SHOP BY SOLUTIONS", icon: "◇" },
  { menuGroup: "Room", title: "SHOP BY ROOM", icon: "⌂" },
  { menuGroup: "Category", title: "SHOP BY CATEGORY", icon: "▦" },
];

function Icon({ children, size = 24 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  );
}

function SearchIcon() {
  return (
    <Icon size={21}>
      <circle cx="11" cy="11" r="6.7" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m16 16 4.1 4.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </Icon>
  );
}

function AccountIcon() {
  return (
    <Icon size={27}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

function BagIcon() {
  return (
    <Icon size={27}>
      <path
        d="M5.5 8.5h13l-.7 11h-11.6l-.7-11Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9 9V6.7a3 3 0 0 1 6 0V9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

function Chevron({
  direction = "down",
}: {
  direction?: "down" | "left" | "right";
}) {
  const path =
    direction === "down"
      ? "m8 10 4 4 4-4"
      : direction === "left"
        ? "m14 7-5 5 5 5"
        : "m10 7 5 5-5 5";
  return (
    <Icon size={20}>
      <path
        d={path}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Icon>
  );
}

function BrandLogo({ large = false }: { large?: boolean }) {
  return (
    <span
      className={large ? styles.brandLarge : styles.brand}
      aria-label="Sofistike +XTRA"
    >
      <span className={styles.brandTop}>SOFİSTİKE</span>
      <span className={styles.brandBottom}>
        <span className={styles.brandPlus}>+</span>
        <span className={styles.brandX}>X</span>
        <span>TRA</span>
      </span>
    </span>
  );
}

function SpriteCard({
  item,
  small = false,
}: {
  item: ModuleItem;
  small?: boolean;
}) {
  const style = {
    "--sprite-x": `-${item.x}%`,
    "--sprite-y": `-${item.y}%`,
    "--module-color": item.color,
  } as CSSProperties;

  return (
    <span
      className={small ? styles.spriteThumb : styles.spriteCard}
      style={style}
    >
      <span className={styles.spriteImage} aria-hidden="true" />
    </span>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function ProductCard({
  product,
  compact = false,
  favorite,
  favoriteBusy,
  onSelect,
  onToggleFavorite,
}: {
  product: ProductItem;
  compact?: boolean;
  favorite: boolean;
  favoriteBusy: boolean;
  onSelect: (product: ProductItem) => void;
  onToggleFavorite: (product: ProductItem) => Promise<void>;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const style = {
    "--product-image": `url(${product.image})`,
    "--product-color": product.color,
  } as CSSProperties;
  const available = product.stock !== "Yakında";

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const addToCart = async () => {
    if (!available) return;
    try {
      await addItem(toCartProduct(product));
      setAdded(true);
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = window.setTimeout(() => setAdded(false), 1800);
    } catch {
      // Sepet sağlayıcısı kullanıcıya gösterilecek hata durumunu yönetir.
    }
  };

  return (
    <article
      className={`${styles.productCard} ${compact ? styles.productCardCompact : ""}`}
      style={style}
    >
      <button
        aria-label={`${product.name} ürün detaylarını aç`}
        className={styles.productCardLink}
        onClick={() => onSelect(product)}
        type="button"
      />
      <div className={styles.productVisual}>
        {product.badge && <span>{product.badge}</span>}
      </div>
      <button
        aria-label={
          favorite
            ? `${product.name} favorilerden çıkar`
            : `${product.name} favorilere ekle`
        }
        aria-pressed={favorite}
        className={`${styles.favoriteButton} ${favorite ? styles.favoriteButtonActive : ""}`}
        disabled={favoriteBusy}
        onClick={() => void onToggleFavorite(product)}
        type="button"
      >
        <HeartIcon filled={favorite} />
      </button>
      <div className={styles.productInfo}>
        <span className={styles.productCategory}>{product.category}</span>
        <h3>{product.name}</h3>
        <div
          aria-label={`${product.rating.toLocaleString("tr-TR", { minimumFractionDigits: 1 })} puan, ${product.reviewCount} yorum`}
          className={styles.productRating}
        >
          <span aria-hidden="true">★</span>
          <strong>
            {product.rating.toLocaleString("tr-TR", {
              minimumFractionDigits: 1,
            })}
          </strong>
          <small>({product.reviewCount} yorum)</small>
        </div>
        <p>{product.description}</p>
        <div className={styles.productAvailability}>
          <span data-stock={product.stock}>
            <i aria-hidden="true" /> {product.stock}
          </span>
        </div>
        <div className={styles.productMeta}>
          <div className={styles.productPrice}>
            <strong>{product.price}</strong>
            <small>Tahmini kargoya teslim: {product.delivery}</small>
          </div>
          <button
            className={added ? styles.addedButton : ""}
            disabled={!available}
            onClick={addToCart}
            type="button"
          >
            {added ? "Sepete eklendi ✓" : available ? "Sepete ekle" : "Yakında"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const { addItem } = useCart();
  const [dragging, setDragging] = useState(false);
  const [heroExpanded, setHeroExpanded] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(fallbackHeroSlides);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );
  const [shopOpen, setShopOpen] = useState(false);
  const [shopGroups, setShopGroups] = useState<ShopGroup[]>(fallbackShopGroups);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<string>>(
    new Set(),
  );
  const [catalogProducts, setCatalogProducts] = useState<ProductItem[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const moduleRailRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScroll: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadShopCategories() {
      try {
        const response = await fetch("/api/catalog/categories", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Kategoriler yüklenemedi.");
        const categories = (await response.json()) as CatalogCategory[];
        if (!cancelled) {
          setShopGroups(
            shopGroupDefinitions.map((group) => ({
              menuGroup: group.menuGroup,
              title: group.title,
              links: categories
                .filter((category) => category.menuGroup === group.menuGroup)
                .sort(
                  (left, right) =>
                    left.displayOrder - right.displayOrder ||
                    left.name.localeCompare(right.name, "tr-TR"),
                )
                .map((category) => [group.icon, category.name, category.slug]),
            })),
          );
        }
      } catch {
        // Kategori servisi geçici olarak kapalıysa mevcut menü gösterilir.
      }
    }

    void loadShopCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBanners() {
      try {
        const response = await fetch("/api/content/banners", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Bannerlar yüklenemedi.");
        const payload = (await response.json()) as HomeBanner[];
        if (!cancelled) {
          setHeroSlides(payload);
          setHeroSlideIndex(0);
        }
      } catch {
        // İçerik servisi geçici olarak kapalıysa mevcut tasarım gösterilir.
      }
    }

    void loadBanners();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const category = new URLSearchParams(window.location.search).get(
          "category",
        );
        const categoryQuery = category
          ? `&category=${encodeURIComponent(category)}`
          : "";
        const response = await fetch(
          `/api/catalog/products?page=1&pageSize=100&sort=Recommended${categoryQuery}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Ürün kataloğu yüklenemedi.");
        const payload = (await response.json()) as PagedCatalogProducts;
        if (!cancelled) {
          setCatalogProducts(payload.items.map(mapCatalogProduct));
          setCatalogError("");
        }
      } catch {
        if (!cancelled) {
          setCatalogError(
            "Canlı ürün kataloğuna ulaşılamadı; örnek ürünler gösteriliyor.",
          );
        }
      } finally {
        if (!cancelled) setCatalogLoaded(true);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        const response = await fetch(
          "/api/account/favorites?page=1&pageSize=100",
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as BackendPagedFavorites;
        if (!cancelled) {
          setFavoriteIds(new Set(payload.items.map((item) => item.product.id)));
        }
      } catch {
        // Favori servisi erişilemezse ürün keşfi çalışmaya devam eder.
      }
    }

    void loadFavorites();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!heroExpanded || heroSlides.length <= 1) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [heroExpanded, heroSlides.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const rail = moduleRailRef.current;
      if (rail && !dragState.current.active) {
        rail.scrollLeft += 2;
        const halfway = rail.scrollWidth / 2;
        if (rail.scrollLeft >= halfway) rail.scrollLeft -= halfway;
      }
    }, 20);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProduct(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedProduct]);

  const startModuleDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rail = moduleRailRef.current;
    if (!rail) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: rail.scrollLeft,
    };
    setDragging(true);
  };

  const moveModuleDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = moduleRailRef.current;
    if (!rail || !dragState.current.active) return;
    const distance = event.clientX - dragState.current.startX;
    if (Math.abs(distance) > 4) dragState.current.moved = true;
    rail.scrollLeft = dragState.current.startScroll - distance;
  };

  const finishModuleDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  async function toggleFavorite(product: ProductItem) {
    if (pendingFavoriteIds.has(product.id)) return;

    const wasFavorite = favoriteIds.has(product.id);
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (wasFavorite) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    setPendingFavoriteIds((current) => new Set(current).add(product.id));

    try {
      const response = await fetch(`/api/account/favorites/${product.id}`, {
        method: wasFavorite ? "DELETE" : "POST",
      });
      if (response.status === 401) {
        setFavoriteIds((current) => {
          const next = new Set(current);
          if (wasFavorite) next.add(product.id);
          else next.delete(product.id);
          return next;
        });
        const redirect = `${window.location.pathname}${window.location.hash}`;
        window.location.assign(
          `/login?redirect=${encodeURIComponent(redirect)}`,
        );
        return;
      }
      if (!response.ok) throw new Error("Favorite request failed");
    } catch {
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (wasFavorite) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
    } finally {
      setPendingFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  }

  const hasLiveCatalog = catalogLoaded && !catalogError;
  const featuredProducts = hasLiveCatalog
    ? catalogProducts.filter((product) => product.isPopular).slice(0, 3)
    : fallbackFeaturedProducts;
  const labProducts = hasLiveCatalog ? catalogProducts : fallbackLabProducts;
  const currentHeroSlide = heroSlides[heroSlideIndex];

  return (
    <main className={styles.page}>
      <div className={styles.headerShell}>
        <nav className={styles.utilityBar} aria-label="Yardımcı menü">
          <a href="#customer-innovators-sign-in">Customer Innovators Sign in</a>
          <a href="#language">
            Language <span>TR</span>
          </a>
          <a href="#business-partner-login">Business Partner Login</a>
        </nav>

        <header className={styles.header}>
          <a
            className={styles.logoLink}
            href="#anasayfa"
            aria-label="Sofistike +XTRA ana sayfa"
          >
            <BrandLogo />
          </a>

          <nav className={styles.nav} aria-label="Ana menü">
            <a className={styles.activeNav} href="#anasayfa">
              Ana Sayfa
            </a>
            <div
              className={`${styles.shopMenu} ${shopOpen ? styles.menuOpen : ""}`}
              onMouseLeave={() => setShopOpen(false)}
            >
              <a
                aria-expanded={shopOpen}
                href="#moduller"
                onClick={(event) => {
                  event.preventDefault();
                  setShopOpen((value) => !value);
                }}
              >
                Shop <Chevron />
              </a>
              <div className={styles.megaMenu}>
                {shopGroups.map((group) => (
                  <div key={group.title}>
                    <h3>{group.title}</h3>
                    {group.links.map(([icon, link, slug]) => (
                      <a
                        href={`/kategori/${encodeURIComponent(slug)}`}
                        key={slug}
                        onClick={() => setShopOpen(false)}
                      >
                        <span aria-hidden="true">{icon}</span>
                        {link}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <a href="#innovation-lab">Innovation Lab</a>
          </nav>

          <div className={styles.navActions}>
            <label className={styles.search}>
              <span className={styles.srOnly}>Ürün ara</span>
              <input placeholder="Akıllı fikirlerde ara..." type="search" />
              <SearchIcon />
            </label>
            <a className={styles.actionLink} href="#hesabim">
              <AccountIcon />
              <span>Hesabım</span>
            </a>
            <a className={styles.actionLink} href="#sepet">
              <BagIcon />
              <span>Sepet</span>
            </a>
          </div>
        </header>
      </div>

      {currentHeroSlide ? (
        <section
          className={`${styles.hero} ${styles.manifestoHero} ${
            heroExpanded ? styles.heroExpanded : styles.heroCollapsed
          }`}
          id="anasayfa"
        >
          {heroSlides.map((slide, index) => {
            const isRemoteImage = slide.imageUrl.startsWith("https://");
            return (
              <Image
                alt={index === heroSlideIndex ? slide.altText : ""}
                aria-hidden={index !== heroSlideIndex}
                className={`${styles.manifestoHeroImage} ${
                  index === heroSlideIndex
                    ? styles.manifestoHeroImageActive
                    : ""
                }`}
                fetchPriority={index === 0 ? "high" : "auto"}
                fill
                key={slide.id}
                loader={isRemoteImage ? passthroughImageLoader : undefined}
                priority={index === 0}
                sizes="100vw"
                src={slide.imageUrl}
                unoptimized={isRemoteImage}
              />
            );
          })}

          {currentHeroSlide.title ||
          currentHeroSlide.description ||
          (currentHeroSlide.buttonText && currentHeroSlide.linkUrl) ? (
            <div className={styles.manifestoHeroContent}>
              {currentHeroSlide.title ? (
                <h1>{currentHeroSlide.title}</h1>
              ) : null}
              {currentHeroSlide.description ? (
                <p>{currentHeroSlide.description}</p>
              ) : null}
              {currentHeroSlide.buttonText && currentHeroSlide.linkUrl ? (
                <a href={currentHeroSlide.linkUrl}>
                  {currentHeroSlide.buttonText}
                </a>
              ) : null}
            </div>
          ) : null}

          <button
            aria-expanded={heroExpanded}
            aria-label={
              heroExpanded ? "Marka görselini kapat" : "Marka görselini aç"
            }
            className={styles.heroToggle}
            onClick={() => setHeroExpanded((value) => !value)}
            type="button"
          >
            <span aria-hidden="true">{heroExpanded ? "↑" : "↓"}</span>
          </button>
        </section>
      ) : null}

      <section className={styles.modules} id="moduller">
        <div className={styles.sectionHeading}>
          <div>
            <h2>Hayatınıza uygun çözümü seçin</h2>
            <p>
              Yavaşça ilerleyen kartları fareyle veya dokunarak iki yöne
              sürükleyebilirsiniz.
            </p>
          </div>
        </div>
        <div
          className={`${styles.moduleRail} ${dragging ? styles.dragging : ""}`}
          onPointerDown={startModuleDrag}
          onPointerMove={moveModuleDrag}
          onPointerUp={finishModuleDrag}
          onPointerCancel={finishModuleDrag}
          ref={moduleRailRef}
        >
          <div className={styles.moduleTrack}>
            {[...modules, ...modules].map((item, index) => (
              <a
                data-module-card
                href={
                  item.name === "İnovasyon Lab"
                    ? "#innovation-lab"
                    : "#moduller"
                }
                key={`${item.name}-${index}`}
                aria-label={`${item.name} modülünü keşfet`}
                aria-hidden={index >= modules.length}
                tabIndex={index >= modules.length ? -1 : undefined}
                onClick={(event) => {
                  if (dragState.current.moved) {
                    event.preventDefault();
                    dragState.current.moved = false;
                  }
                }}
              >
                <SpriteCard item={item} />
              </a>
            ))}
          </div>
        </div>
        <div className={styles.railStatus}>
          <span className={styles.railProgress}>
            <i />
          </span>
          <span>Kaydırabilirsiniz</span>
        </div>
      </section>

      <section className={styles.productShowcase} id="urunler">
        <div className={styles.showcaseIntro}>
          <span className={styles.eyebrow}>POPÜLER ÜRÜNLER</span>
          <h2>En çok sevilen ürünler.</h2>
          <p>
            Kullanıcıların en çok incelediği ve günlük yaşamında tercih ettiği
            ürünleri keşfedin.
          </p>
          <a className={styles.textButton} href="#tum-urunler">
            Tüm ürün seçkisini gör →
          </a>
        </div>
        {catalogError ? <p role="status">{catalogError}</p> : null}
        <div className={styles.featuredRail} aria-label="Popüler ürünler">
          {featuredProducts.map((product) => (
            <ProductCard
              favorite={favoriteIds.has(product.id)}
              favoriteBusy={pendingFavoriteIds.has(product.id)}
              key={product.name}
              onSelect={setSelectedProduct}
              onToggleFavorite={toggleFavorite}
              product={product}
            />
          ))}
        </div>
      </section>

      <section
        className={styles.labProductShowcase}
        aria-labelledby="lab-products-title"
        id="tum-urunler"
      >
        <div className={styles.labProductHeading}>
          <div>
            <span className={styles.eyebrow}>TÜM ÜRÜNLER</span>
            <h2 id="lab-products-title">Tüm ürünleri keşfedin.</h2>
            <p>
              Evinizin farklı alanları için geliştirilen Sofistike ürünlerini
              sade ve kolay incelenebilir bir listede keşfedin.
            </p>
          </div>
        </div>
        <div
          aria-label="Sofistike +XTRA ürünleri"
          className={styles.labProductList}
        >
          {labProducts.map((product) => (
            <ProductCard
              compact
              favorite={favoriteIds.has(product.id)}
              favoriteBusy={pendingFavoriteIds.has(product.id)}
              key={product.name}
              onSelect={setSelectedProduct}
              onToggleFavorite={toggleFavorite}
              product={product}
            />
          ))}
        </div>
        <div className={styles.labProductStatus}>
          <span>
            <i aria-hidden="true" /> Tüm seçki tek bakışta
          </span>
          <a href="#urunler">Popüler ürünlere dön ↑</a>
        </div>
      </section>

      {selectedProduct ? (
        <div
          className={styles.productQuickViewBackdrop}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedProduct(null);
          }}
          role="presentation"
        >
          <section
            aria-labelledby="quick-view-title"
            aria-modal="true"
            className={styles.productQuickView}
            role="dialog"
            style={
              {
                "--product-image": `url(${selectedProduct.image})`,
                "--product-color": selectedProduct.color,
              } as CSSProperties
            }
          >
            <button
              aria-label="Ürün detaylarını kapat"
              className={styles.productQuickViewClose}
              onClick={() => setSelectedProduct(null)}
              type="button"
            >
              ×
            </button>
            <div className={styles.productQuickViewVisual} aria-hidden="true" />
            <div className={styles.productQuickViewCopy}>
              <span>{selectedProduct.category}</span>
              <h2 id="quick-view-title">{selectedProduct.name}</h2>
              <div className={styles.productQuickViewRating}>
                <b aria-hidden="true">★</b>
                {selectedProduct.rating.toLocaleString("tr-TR", {
                  minimumFractionDigits: 1,
                })}{" "}
                <small>({selectedProduct.reviewCount} yorum)</small>
              </div>
              <p>{selectedProduct.description}</p>
              <strong>{selectedProduct.price}</strong>
              <ul>
                <li>{selectedProduct.stock}</li>
                <li>Tahmini kargoya teslim: {selectedProduct.delivery}</li>
              </ul>
              <button
                disabled={selectedProduct.stock === "Yakında"}
                onClick={async () => {
                  try {
                    await addItem(toCartProduct(selectedProduct));
                    setSelectedProduct(null);
                  } catch {
                    // Sepet sağlayıcısı kullanıcıya gösterilecek hatayı yönetir.
                  }
                }}
                type="button"
              >
                {selectedProduct.stock === "Yakında"
                  ? "Yakında"
                  : "Sepete ekle"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section className={styles.innovation} id="innovation-lab">
        <div className={styles.labShowcase}>
          <section
            className={styles.insightExamples}
            aria-labelledby="insights-title"
          >
            <div className={styles.labSectionHeading}>
              <span className={styles.eyebrow}>GERÇEK YORUMLARDAN</span>
              <h2 id="insights-title">Güncel içgörülerden örnekler</h2>
              <p>
                Sorunu dinliyor, çözümün hangi aşamada olduğunu açıkça
                paylaşıyoruz.
              </p>
            </div>
            <div className={styles.insightGrid}>
              <article>
                <div className={styles.insightPhoto} aria-hidden="true">
                  <SpriteCard item={modules[0]} />
                </div>
                <span className={styles.insightIcon} aria-hidden="true">
                  ☾
                </span>
                <p className={styles.insightModule}>+XTRA SLEEP</p>
                <small>Kullanıcıların en çok şikâyet ettiği:</small>
                <blockquote>“Yastık zamanla çöküyor.”</blockquote>
                <h3>Çözümümüz</h3>
                <p>Ayarlanabilir yükseklik ve refil iç dolgu sistemi.</p>
                <strong className={styles.solved}>✓ Çözüldü</strong>
              </article>
              <article>
                <div className={styles.insightPhoto} aria-hidden="true">
                  <SpriteCard item={modules[5]} />
                </div>
                <span className={styles.insightIcon} aria-hidden="true">
                  ♧
                </span>
                <p className={styles.insightModule}>+XTRA LAUNDRY</p>
                <small>Kullanıcıların en çok şikâyet ettiği:</small>
                <blockquote>“Kurutma çok uzun sürüyor.”</blockquote>
                <h3>Üzerinde çalışıyoruz</h3>
                <p>Daha hızlı kurutma sağlayan özel kumaş teknolojisi.</p>
                <strong className={styles.developing}>
                  ⚑ Geliştirme aşamasında
                </strong>
              </article>
              <article>
                <div className={styles.insightPhoto} aria-hidden="true">
                  <SpriteCard item={modules[3]} />
                </div>
                <span className={styles.insightIcon} aria-hidden="true">
                  ◇
                </span>
                <p className={styles.insightModule}>+XTRA KITCHEN</p>
                <small>Kullanıcıların en çok şikâyet ettiği:</small>
                <blockquote>“Süngerler 2 günde kötü koku yapıyor.”</blockquote>
                <h3>Üzerinde çalışıyoruz</h3>
                <p>Koku yapmayan, hızlı kuruyan yeni nesil sünger.</p>
                <strong className={styles.prototype}>
                  ⚑ Prototip aşamasında
                </strong>
              </article>
            </div>
          </section>
        </div>

        <div className={styles.evidence}>
          <div className={styles.simpleMetrics}>
            <article>
              <strong>10.482+</strong>
              <span>Yorum</span>
            </article>
            <article>
              <strong>347+</strong>
              <span>Fikir</span>
            </article>
            <article>
              <strong>92+</strong>
              <span>Ürün</span>
            </article>
            <article>
              <strong>14+</strong>
              <span>Ülke</span>
            </article>
          </div>
          <article className={styles.currentInsight} id="surec">
            <div className={styles.coCreateCopy}>
              <span className={styles.eyebrow}>REVIEW LAB™ · CO-CREATE</span>
              <h2>Bir sonraki ürünü birlikte tasarlayalım.</h2>
              <div
                className={styles.coCreateProcess}
                aria-label="Dinle, keşfet, geliştir, tasarla ve sun"
              >
                {[
                  ["01", "Dinle"],
                  ["02", "Keşfet"],
                  ["03", "Geliştir"],
                  ["04", "Tasarla"],
                  ["05", "Sun"],
                ].map(([number, title]) => (
                  <span key={number}>
                    <b>{number}</b>
                    {title}
                  </span>
                ))}
              </div>
              <ul>
                <li>Fikirleri görüntüle</li>
                <li>Oylamaya katıl</li>
                <li>Sonucu ilk sen öğren</li>
              </ul>
              <a href="#hesabim">Şimdi oyla →</a>
            </div>
            <div className={styles.phoneMockup} aria-hidden="true">
              <span className={styles.phoneNotch} />
              <small>CO-CREATE</small>
              <strong>Sıradaki ürün hangisi olsun?</strong>
              <div>
                <i>+XTRA</i>
                <span>Travel Sun</span>
                <b>1.284 oy</b>
              </div>
              <div>
                <i>+XTRA</i>
                <span>Dry Mat</span>
                <b>982 oy</b>
              </div>
            </div>
          </article>
        </div>

        <section
          className={styles.marketplaces}
          aria-labelledby="marketplaces-title"
        >
          <div className={styles.marketplaceHeading}>
            <div>
              <span className={styles.eyebrow}>PAZARYERİ ENTEGRASYONU</span>
              <h2 id="marketplaces-title">Bizi sevdiğiniz yerde bulun.</h2>
            </div>
            <p>Türkiye&apos;de ve dünyada seçili pazaryerlerindeyiz.</p>
          </div>

          <div className={styles.marketplaceGroup}>
            <div className={styles.marketplaceLabel}>
              <span>01</span>
              <strong>Yurt içi pazaryerleri</strong>
            </div>
            <div
              className={styles.marketplaceMarquee}
              aria-label="Yurt içi pazaryerleri"
            >
              <div className={styles.marketplaceTrack}>
                {[...domesticMarketplaces, ...domesticMarketplaces].map(
                  (marketplace, index) => (
                    <span
                      aria-hidden={index >= domesticMarketplaces.length}
                      className={styles.marketplaceLogo}
                      key={`${marketplace}-${index}`}
                    >
                      {marketplace}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className={styles.marketplaceGroup}>
            <div className={styles.marketplaceLabel}>
              <span>02</span>
              <strong>Yurt dışı pazaryerleri</strong>
            </div>
            <div
              className={`${styles.marketplaceMarquee} ${styles.marketplaceMarqueeReverse}`}
              aria-label="Yurt dışı pazaryerleri"
            >
              <div className={styles.marketplaceTrack}>
                {[...globalMarketplaces, ...globalMarketplaces].map(
                  (marketplace, index) => (
                    <span
                      aria-hidden={index >= globalMarketplaces.length}
                      className={styles.marketplaceLogo}
                      key={`${marketplace}-${index}`}
                    >
                      {marketplace}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className={styles.marketplaceCta}>
            <a href="#urunler">
              Alışverişe başla <span>→</span>
            </a>
          </div>
        </section>

        <div className={styles.simpleManifesto}>
          <div className={styles.simpleManifestoCopy}>
            <span className={styles.eyebrow}>MANİFESTO</span>
            <p className={styles.manifestoLeadline}>Biz ürün tasarlamıyoruz.</p>
            <h2>
              <span className={styles.manifestoCustomer}>
                Müşterilerin yaşadığı
              </span>
              <br />
              <span className={styles.manifestoProblem}>problemleri</span>{" "}
              <strong>yeniden tasarlıyoruz.</strong>
            </h2>
            <p>
              Sofistike +XTRA Innovation Lab, gerçek kullanıcı ihtiyaçlarını
              günlük yaşamı kolaylaştıran çözümlere dönüştürür.
            </p>
            <div className={styles.manifestoKeywords}>
              <span>Dinle</span>
              <i>·</i>
              <span>Anla</span>
              <i>·</i>
              <span>İyileştir</span>
            </div>
          </div>
        </div>

        <footer className={styles.combinedFooter}>
          <p className={styles.footerPromise}>
            <strong>Better Sleep</strong>
            <span>·</span>
            <strong>Better Home</strong>
            <span>·</span>
            <strong>Better Living</strong>
          </p>

          <div className={styles.footerContact}>
            <a
              className={styles.footerWebsite}
              href="https://sofistikextra.com"
              rel="noreferrer"
              target="_blank"
            >
              <span aria-hidden="true">◎</span>
              sofistikextra.com
            </a>

            <div className={styles.footerSocials}>
              <a
                aria-label="Sofistike XTRA Instagram"
                href="https://instagram.com/sofistikextra"
                rel="noreferrer"
                target="_blank"
              >
                ◎
              </a>
              <a
                aria-label="Sofistike XTRA Facebook"
                href="https://facebook.com/sofistikextra"
                rel="noreferrer"
                target="_blank"
              >
                f
              </a>
              <a
                aria-label="Sofistike XTRA YouTube"
                href="https://youtube.com/@sofistikextra"
                rel="noreferrer"
                target="_blank"
              >
                ▶
              </a>
              <a
                aria-label="Sofistike XTRA TikTok"
                href="https://tiktok.com/@sofistikextra"
                rel="noreferrer"
                target="_blank"
              >
                ♪
              </a>
              <span>@sofistikextra</span>
            </div>
          </div>

          <a className={styles.ideaCta} href="#hesabim">
            <span className={styles.ideaGirl} aria-hidden="true" />
            <span className={styles.ideaCtaText}>Bir fikrim var</span>
            <span className={styles.ideaCtaArrow} aria-hidden="true">
              →
            </span>
          </a>
        </footer>
      </section>
    </main>
  );
}
