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

type ServiceItem = {
  icon: string;
  title: string;
  description: string;
  color: string;
  position: string;
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

const featuredProducts: ProductItem[] = [
  {
    name: "+XTRA Sakin Aroma",
    category: "Aroma",
    description: "Lavanta ve amber notalarıyla evin havasını yumuşatır.",
    price: "₺349",
    badge: "Review Lab",
    image: "/images/hero-home.png",
    color: "#6c7a4e",
  },
  {
    name: "Yastık & Tekstil Ferahlatıcı",
    category: "Uyku",
    description: "Yatak odası tekstillerinde temiz ve rahatlatıcı his.",
    price: "₺279",
    image: "/images/hero-sleep.png",
    color: "#a6a3cb",
  },
  {
    name: "Bulaşık Deterjanı Limon",
    category: "Mutfak",
    description: "Günlük mutfak düzeni için canlı limon ferahlığı.",
    price: "₺189",
    image: "/images/hero-home.png",
    color: "#dba13a",
  },
];

const serviceItems: ServiceItem[] = [
  {
    icon: "…",
    title: "Review Audit™",
    description:
      "Rakip ve kategori yorumlarında tekrar eden ihtiyaçları keşfederiz.",
    color: "#c9694a",
    position: "0 0",
  },
  {
    icon: "□",
    title: "Product Audit™",
    description:
      "Mevcut ürünün performansını kullanıcı deneyimiyle birlikte inceleriz.",
    color: "#a6a3cb",
    position: "50% 0",
  },
  {
    icon: "◇",
    title: "Packaging Audit™",
    description:
      "Ambalajın kullanım, görünüm ve deneyim tarafını analiz ederiz.",
    color: "#6c7a4e",
    position: "100% 0",
  },
  {
    icon: "◔",
    title: "Category Audit™",
    description:
      "Kategori fırsatlarını ve değişen beklentileri görünür kılarız.",
    color: "#dba13a",
    position: "0 100%",
  },
  {
    icon: "↗",
    title: "Trend Audit™",
    description:
      "Tüketici alışkanlıklarını ve yükselen eğilimleri takip ederiz.",
    color: "#0e5c5a",
    position: "50% 100%",
  },
  {
    icon: "◎",
    title: "Review DNA™",
    description:
      "Ürünün kullanıcılarla kurduğu bağın ayrıntılı haritasını çıkarırız.",
    color: "#a9c9c0",
    position: "100% 100%",
  },
];

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
  const serviceRailRef = useRef<HTMLDivElement>(null);
  const serviceManualUntil = useRef(0);
  const serviceDragState = useRef({
    active: false,
    startY: 0,
    startScroll: 0,
  });
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      const rail = serviceRailRef.current;
      if (
        rail &&
        !serviceDragState.current.active &&
        Date.now() > serviceManualUntil.current
      ) {
        const halfway = rail.scrollHeight / 2;
        if (rail.scrollTop <= 1) rail.scrollTop += halfway;
        rail.scrollTop -= 1;
      }
    }, 34);
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

  const scrollServices = (direction: 1 | -1) => {
    const rail = serviceRailRef.current;
    if (!rail) return;
    serviceManualUntil.current = Date.now() + 1800;
    rail.scrollBy({ top: direction * 150, behavior: "smooth" });
  };

  const startServiceDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    serviceManualUntil.current = Date.now() + 2200;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = serviceRailRef.current;
    if (!rail) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    serviceDragState.current = {
      active: true,
      startY: event.clientY,
      startScroll: rail.scrollTop,
    };
  };

  const moveServiceDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = serviceRailRef.current;
    if (!rail || !serviceDragState.current.active) return;
    rail.scrollTop =
      serviceDragState.current.startScroll -
      (event.clientY - serviceDragState.current.startY);
    serviceManualUntil.current = Date.now() + 1800;
  };

  const finishServiceDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!serviceDragState.current.active) return;
    serviceDragState.current.active = false;
    serviceManualUntil.current = Date.now() + 1600;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

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
      </div>

      <section className={styles.hero} id="anasayfa">
        <div className={styles.heroCopy}>
          <BrandLogo large />
          <h1>
            SMART IDEAS.
            <br />
            <span>BETTER LIVING.</span>
          </h1>
          <p className={styles.listeningSignature}>
            Better starts
            <br />
            with listening.
          </p>
          <p className={styles.promise}>
            Sizi dinliyor, <strong>daha iyi ürünleri</strong> birlikte
            tasarlıyoruz.
          </p>
          <div className={styles.heroButtons}>
            <a className={styles.primaryButton} href="#moduller">
              Alışverişe Başla
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

      <section className={styles.productShowcase} id="urunler">
        <div className={styles.showcaseIntro}>
          <span className={styles.eyebrow}>SOFISTIKE +XTRA SEÇKİSİ</span>
          <h2>Günlük yaşam için düşünülmüş ürünler.</h2>
          <p>
            Kokudan tekstile uzanan, gerçek kullanıcı ihtiyaçlarından doğan
            seçkileri keşfedin.
          </p>
          <a className={styles.textButton} href="#innovation-lab">
            Ürünlerin nasıl geliştiğini gör →
          </a>
        </div>
        <div className={styles.featuredRail} aria-label="Öne çıkan ürünler">
          {featuredProducts.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </section>

      <section className={styles.innovation} id="innovation-lab">
        <div className={styles.simpleManifesto}>
          <div className={styles.manifestoServices}>
            <div className={styles.manifestoServicesHeading}>
              <div>
                <span className={styles.eyebrow}>REVIEW LAB™</span>
                <h2>Hizmetlerimiz</h2>
              </div>
              <span>YAVAŞ OTOMATİK AKIŞ</span>
            </div>

            <div
              aria-label="Review Lab hizmetleri"
              className={styles.serviceFlowViewport}
              onPointerCancel={finishServiceDrag}
              onPointerDown={startServiceDrag}
              onPointerMove={moveServiceDrag}
              onPointerUp={finishServiceDrag}
              onTouchStart={() => {
                serviceManualUntil.current = Date.now() + 2400;
              }}
              onWheel={() => {
                serviceManualUntil.current = Date.now() + 1800;
              }}
              ref={serviceRailRef}
            >
              <div className={styles.serviceFlowTrack}>
                {[...serviceItems, ...serviceItems].map((service, index) => (
                  <article
                    aria-hidden={index >= serviceItems.length}
                    className={styles.serviceFlowCard}
                    key={`${service.title}-${index}`}
                    style={
                      {
                        "--service-color": service.color,
                      } as CSSProperties
                    }
                  >
                    <div
                      className={styles.serviceFlowVisual}
                      aria-hidden="true"
                      style={{ backgroundPosition: service.position }}
                    />
                    <div className={styles.serviceFlowContent}>
                      <span>
                        {String((index % serviceItems.length) + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.serviceFlowControls}>
              <span>Otomatik akış · Kaydırma ve sürükleme açık</span>
              <button
                aria-label="Hizmetleri yukarı kaydır"
                onClick={() => scrollServices(-1)}
                type="button"
              >
                ↑
              </button>
              <button
                aria-label="Hizmetleri aşağı kaydır"
                onClick={() => scrollServices(1)}
                type="button"
              >
                ↓
              </button>
            </div>
          </div>
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
              Akıllı fikirler, daha iyi yaşam. Sofistike +XTRA Innovation Lab,
              gerçek kullanıcı ihtiyaçlarını günlük yaşamı kolaylaştıran
              çözümlere dönüştürür.
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

        <section
          className={styles.reviewProductStrip}
          aria-labelledby="review-products-title"
        >
          <div className={styles.reviewVideoHeading}>
            <span className={styles.eyebrow}>REVIEW LAB DEMOSU</span>
            <h2 id="review-products-title">
              Bir yorumun iyileştirmeye dönüşümünü izleyin.
            </h2>
            <p className={styles.goodYouSignature}>
              Good you <span aria-hidden="true">♡</span>
            </p>
          </div>
          <div
            className={styles.reviewVideoFrame}
            role="img"
            aria-label="İmlecin yorum alanına tıklayıp yorum yazdığı ve yorumun iyileştirme kararına dönüştüğü otomatik Review Lab demosu"
          >
            <span className={styles.reviewVideoBadge}>
              <i aria-hidden="true" /> Otomatik demo
            </span>
          </div>
        </section>

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
