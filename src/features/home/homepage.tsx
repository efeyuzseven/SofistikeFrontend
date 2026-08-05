"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  name: string;
  category: string;
  description: string;
  price: string;
  badge?: string;
  image: string;
  color: string;
};

const modules: ModuleItem[] = [
  { name: "Uyku", color: "#a6a3cb", x: 2.87, y: 11.37 },
  { name: "Ev Tekstili", color: "#c9694a", x: 34.51, y: 11.37 },
  { name: "Aroma", color: "#6c7a4e", x: 66.09, y: 11.37 },
  { name: "Mutfak", color: "#dba13a", x: 2.87, y: 40.59 },
  { name: "Banyo", color: "#0e5c5a", x: 34.51, y: 40.59 },
  { name: "Çamaşır", color: "#a9c9c0", x: 66.09, y: 40.59 },
  { name: "Dekorasyon", color: "#dba13a", x: 2.87, y: 69.5 },
  { name: "Evcil Dostlar", color: "#c9694a", x: 34.51, y: 69.5 },
  { name: "İnovasyon Lab", color: "#0f1b2d", x: 66.09, y: 69.5 },
];

const heroSlides = [
  { name: "Uyku", image: "/images/sofistike-home-reference.png" },
  { name: "Aroma", image: "/images/hero-sleep.png" },
  { name: "Mutfak", image: "/images/hero-home.png" },
  { name: "Banyo", image: "/images/hero-living.png" },
];

const bestSellers: ProductItem[] = [
  {
    name: "Pamuk Dokulu Havlu Seti",
    category: "Banyo",
    description: "Yumuşak dokulu, hızlı kuruyan günlük banyo seti.",
    price: "₺699",
    badge: "Çok Satan",
    image: "/images/hero-living.png",
    color: "#0e5c5a",
  },
  {
    name: "Lavanta Uyku Spreyi",
    category: "Uyku",
    description: "Yastık ve nevresimlerde sakin bir uyku rutini.",
    price: "₺249",
    badge: "Favori",
    image: "/images/hero-sleep.png",
    color: "#a6a3cb",
  },
  {
    name: "Limon Yüzey Temizleyici",
    category: "Mutfak",
    description: "Pratik kullanım, ferah koku ve parlak yüzeyler.",
    price: "₺219",
    image: "/images/hero-home.png",
    color: "#dba13a",
  },
  {
    name: "Kumaş Ferahlatıcı Lavanta",
    category: "Çamaşır",
    description: "Dolap, perde ve ev tekstilinde uzun süreli ferahlık.",
    price: "₺299",
    image: "/images/sofistike-home-reference.png",
    color: "#c9694a",
  },
];

const reviewLabProducts: ProductItem[] = [
  {
    name: "Sakin Aroma Difüzör",
    category: "RL-03",
    description: "Koku yoğunluğu yorumlara göre dengelendi.",
    price: "₺349",
    image: "/images/hero-home.png",
    color: "#6c7a4e",
  },
  {
    name: "Lavanta Tekstil Spreyi",
    category: "RL-07",
    description: "Lekesiz his ve daha kalıcı ferahlık için geliştirildi.",
    price: "₺279",
    image: "/images/hero-sleep.png",
    color: "#a6a3cb",
  },
  {
    name: "Limon Bulaşık Deterjanı",
    category: "RL-11",
    description: "Koku, yoğunluk ve durulanma deneyimi iyileştirildi.",
    price: "₺189",
    image: "/images/hero-home.png",
    color: "#dba13a",
  },
  {
    name: "Yumuşak Havlu Seti",
    category: "RL-14",
    description: "Emicilik ve dokunma hissi kullanıcı notlarıyla yenilendi.",
    price: "₺699",
    image: "/images/hero-living.png",
    color: "#0e5c5a",
  },
];

const shopGroups = [
  {
    title: "SHOP BY SOLUTIONS",
    links: [
      ["☾", "Sleep Better"],
      ["⌁", "Allergy Care"],
      ["⌂", "Home Reset"],
      ["♧", "Laundry Care"],
      ["♨", "Bathroom Care"],
      ["▣", "Kitchen Care"],
      ["♧", "Pet Friendly"],
      ["♡", "Healthy Living"],
      ["▤", "Organization"],
      ["◉", "Innovation Lab"],
    ],
  },
  {
    title: "SHOP BY ROOM",
    links: [
      ["▱", "Bedroom"],
      ["♨", "Bathroom"],
      ["▤", "Living Room"],
      ["▦", "Kitchen"],
      ["▣", "Laundry Room"],
      ["♧", "Kids Room"],
      ["▯", "Guest Room"],
      ["♧", "Pet Area"],
      ["▢", "Travel"],
    ],
  },
  {
    title: "SHOP BY CATEGORY",
    links: [
      ["▤", "Bedding"],
      ["▥", "Bath"],
      ["⌇", "Home Fragrance"],
      ["▣", "Laundry"],
      ["⌁", "Cleaning"],
      ["▢", "Kitchen"],
      ["▯", "Personal Care"],
      ["▤", "Storage & Organization"],
      ["♧", "Pet Care"],
      ["⌁", "Accessories"],
      ["♧", "Gifts"],
    ],
  },
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

function ProductCard({
  product,
  compact = false,
}: {
  product: ProductItem;
  compact?: boolean;
}) {
  const style = {
    "--product-image": `url(${product.image})`,
    "--product-color": product.color,
  } as CSSProperties;

  return (
    <article
      className={`${styles.productCard} ${compact ? styles.productCardCompact : ""}`}
      style={style}
    >
      <div className={styles.productVisual} aria-hidden="true">
        {product.badge && <span>{product.badge}</span>}
      </div>
      <div className={styles.productInfo}>
        <span className={styles.productCategory}>{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className={styles.productMeta}>
          <strong>{product.price}</strong>
          <a href="#sepet">Sepete ekle</a>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const moduleRailRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScroll: 0,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const scrollModules = useCallback((direction: 1 | -1) => {
    const rail = moduleRailRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-module-card]");
    rail.scrollBy({
      left: direction * ((card?.offsetWidth ?? 420) + 18),
      behavior: "smooth",
    });
  }, []);

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

  return (
    <main className={styles.page}>
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
                  {group.links.map(([icon, link]) => (
                    <a
                      href={
                        link === "Innovation Lab"
                          ? "#innovation-lab"
                          : "#moduller"
                      }
                      key={link}
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

      <section className={styles.hero} id="anasayfa">
        <div className={styles.heroCopy}>
          <BrandLogo large />
          <h1>
            SMART IDEAS.
            <br />
            <span>BETTER LIVING.</span>
          </h1>
          <p className={styles.kicker}>
            HOME &amp; LIVING PRODUCTS / EV YAŞAM ÜRÜNLERİ
          </p>
          <p className={styles.promise}>
            En sevdiğiniz ürünlerin binlerce yorumunu okuyor,
            <br />
            sizin için <strong>daha iyi versiyonlarını</strong> tasarlıyoruz.
          </p>
          <div className={styles.heroButtons}>
            <a className={styles.primaryButton} href="#moduller">
              Alışverişe Başla
            </a>
            <a className={styles.secondaryButton} href="#innovation-lab">
              Hikâyemizi Keşfet
            </a>
          </div>
        </div>

        <div
          className={styles.heroVisual}
          aria-label={`${heroSlides[heroIndex].name} ürünleri`}
        >
          {heroSlides.map((slide, index) => (
            <span
              aria-hidden="true"
              className={`${styles.heroSlide} ${
                index === heroIndex ? styles.heroSlideActive : ""
              }`}
              key={slide.name}
              style={
                {
                  "--hero-image": `url(${slide.image})`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </section>

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
        <button
          className={`${styles.railArrow} ${styles.railArrowLeft}`}
          onClick={() => scrollModules(-1)}
          aria-label="Önceki modüller"
        >
          <Chevron direction="left" />
        </button>
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
        <button
          className={`${styles.railArrow} ${styles.railArrowRight}`}
          onClick={() => scrollModules(1)}
          aria-label="Sonraki modüller"
        >
          <Chevron direction="right" />
        </button>
        <div className={styles.railStatus}>
          <span className={styles.railProgress}>
            <i />
          </span>
          <span>Kesintisiz otomatik akış</span>
          <span className={styles.manualHint}>• Manuel sürükleme açık</span>
          <span className={styles.miniDots}>●　●　●　●　●</span>
          <span className={styles.autoLive}>AKIŞ AÇIK</span>
        </div>
      </section>

      <section className={styles.bestSellers} id="cok-satanlar">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>MAĞAZA</span>
            <h2>Çok satan ürünlerimiz</h2>
            <p>
              En çok incelenen, sepete eklenen ve tekrar alınan +XTRA ürünleri.
            </p>
          </div>
          <a className={styles.textButton} href="#moduller">
            Tüm ürünler →
          </a>
        </div>
        <div className={styles.bestSellerGrid}>
          {bestSellers.map((product) => (
            <ProductCard compact key={product.name} product={product} />
          ))}
        </div>
      </section>

      <section className={styles.innovation} id="innovation-lab">
        <section
          className={styles.brandDifference}
          aria-labelledby="problemden-urune"
        >
          <div className={styles.brandDifferenceLead}>
            <span className={styles.eyebrow}>REVIEW LAB ÖRNEĞİ</span>
            <h2 id="problemden-urune">Yorumlardan doğan ürünler.</h2>
            <p>
              Bir problemi seçiyoruz, kullanım deneyimini yeniden düşünüyoruz,
              ürüne dönüştürüyoruz.
            </p>
          </div>
          <article className={styles.problemStory}>
            <div
              className={styles.problemVisual}
              aria-label="+XTRA Aroma Sleep ürün örneği"
            >
              <span>Lavanta Tekstil Spreyi</span>
            </div>
            <div className={styles.problemStoryCopy}>
              <span>Problem</span>
              <h3>Ferahlık kalıcı hissedilmiyor.</h3>
              <p>
                Koku yoğunluğu, kullanım sıklığı ve tekstil hissi yorumlardan
                yeniden ele alınır; sonuç daha dengeli ve daha pratik bir
                kullanım deneyimidir.
              </p>
              <a className={styles.storyButton} href="#surec">
                Review Lab ürünlerini keşfet
              </a>
            </div>
          </article>
        </section>

        <div className={styles.simpleReview} id="surec">
          <div className={styles.reviewProductsHeader}>
            <span className={styles.eyebrow}>SEÇİLİ ÜRÜNLER</span>
            <h2>Review Lab ürünleri</h2>
          </div>
          <div className={styles.reviewProductGrid}>
            {reviewLabProducts.slice(0, 3).map((product) => (
              <ProductCard compact key={product.name} product={product} />
            ))}
          </div>
          <a className={styles.reviewAllButton} href="#surec">
            Tüm Review Lab ürünlerini keşfet
          </a>
        </div>

        <footer className={styles.siteFooter} id="iletisim">
          <div className={styles.footerBrand}>
            <BrandLogo />
            <p>
              Müşterilerin yaşadığı problemleri yeniden tasarlayan ev ve yaşam
              ürünleri.
            </p>
          </div>
          <nav aria-label="Alt menü mağaza">
            <h2>Shop</h2>
            <a href="#moduller">Uyku</a>
            <a href="#moduller">Aroma</a>
            <a href="#moduller">Mutfak</a>
            <a href="#moduller">Banyo</a>
          </nav>
          <nav aria-label="Alt menü marka">
            <h2>Marka</h2>
            <a href="#innovation-lab">Review Lab</a>
            <a href="#cok-satanlar">Çok satanlar</a>
            <a href="#anasayfa">Ana sayfa</a>
          </nav>
          <div className={styles.footerHelp}>
            <h2>Yardım</h2>
            <a href="#iletisim">Kargo ve teslimat</a>
            <a href="#iletisim">İade ve değişim</a>
            <a href="#iletisim">İletişim</a>
          </div>
          <form
            className={styles.footerNewsletter}
            onSubmit={(event) => event.preventDefault()}
          >
            <h2>Akıllı fikirlerden haberdar olun</h2>
            <label>
              <span className={styles.srOnly}>E-posta adresi</span>
              <input placeholder="E-posta adresiniz" type="email" />
            </label>
            <button type="submit">Kaydol</button>
          </form>
          <div className={styles.footerBottom}>
            <span>© 2026 Sofistike +XTRA</span>
            <span>Gizlilik · Kullanım koşulları</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
