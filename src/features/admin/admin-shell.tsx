"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AdminConfirmModal } from "./admin-confirm-modal";
import { Icon, type IconName } from "./admin-icons";
import styles from "./admin-shell.module.css";

type NavItem = {
  label: string;
  icon: IconName;
  href?: string;
};

const navItems: NavItem[] = [
  { label: "Genel Bakış", icon: "home", href: "/admin" },
  { label: "Ürünler", icon: "products", href: "/admin/products" },
  { label: "Stok Yönetimi", icon: "stock", href: "/admin/inventory" },
  { label: "Siparişler", icon: "orders", href: "/admin/orders" },
  { label: "Ödemeler", icon: "payments", href: "/admin/payments" },
  {
    label: "İade ve İptaller",
    icon: "returns",
    href: "/admin/refunds-cancellations",
  },
  { label: "B2C Müşteriler", icon: "customers", href: "/admin/customers" },
  { label: "B2B Yönetimi", icon: "b2b", href: "/admin/b2b" },
  {
    label: "Entegrasyonlar",
    icon: "integrations",
    href: "/admin/integrations",
  },
  { label: "+XTRA İçgörüleri", icon: "insights", href: "/admin/insights" },
  { label: "Raporlar", icon: "reports", href: "/admin/reports" },
  { label: "Ayarlar", icon: "settings", href: "/admin/settings" },
];

const routeHeadings = {
  dashboard: {
    title: "Genel Bakış",
    description: "Tüm satış kanallarının merkezi özeti",
  },
  products: {
    title: "Ürün Yönetimi",
    description:
      "Sofistike ürünlerini, fiyatlarını ve satış durumlarını yönetin.",
  },
  inventory: {
    title: "Stok Yönetimi",
    description:
      "Ürün stoklarını, kritik seviyeleri ve stok hareketlerini takip edin.",
  },
  orders: {
    title: "Sipariş Yönetimi",
    description:
      "B2C ve B2B siparişlerini tek bir yerden takip edin ve yönetin.",
  },
  payments: {
    title: "Ödemeler",
    description:
      "Tahsilat, iade ve e-fatura durumlarını tüm satış kanallarında izleyin.",
  },
  refunds: {
    title: "İade ve İptaller",
    description:
      "İade ve iptal taleplerini tüm satış kanallarında takip edin ve değerlendirin.",
  },
  customers: {
    title: "B2C Müşteriler",
    description:
      "Müşteri deneyimini, segmentleri ve +XTRA Rewards etkileşimini yönetin.",
  },
  b2b: {
    title: "B2B Yönetimi",
    description:
      "Kurumsal başvuruları, iş ortaklarını ve proje taleplerini yönetin.",
  },
  integrations: {
    title: "Entegrasyonlar",
    description:
      "Satış, ödeme, lojistik ve müşteri deneyimi bağlantılarını yönetin.",
  },
  insights: {
    title: "+XTRA İçgörüleri",
    description:
      "Önemli sorunları, fırsatları ve önerilen aksiyonları değerlendirin.",
  },
  reports: {
    title: "Raporlar",
    description:
      "Sayısal sonuçları, dönem karşılaştırmalarını ve detay kayıtlarını inceleyin.",
  },
  settings: {
    title: "Ayarlar",
    description:
      "Panel yapılandırmasını, yönetici erişimlerini ve güvenlik tercihlerini yönetin.",
  },
  profile: {
    title: "Profilim",
    description: "Hesap bilgilerinizi ve tercihlerinizi yönetin",
  },
};

function getCurrentAdminDate() {
  const now = new Date();
  return {
    dateTime: now.toISOString(),
    label: new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      timeZone: "Europe/Istanbul",
    }).format(now),
  };
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const isProducts = pathname.startsWith("/admin/products");
  const isInventory = pathname.startsWith("/admin/inventory");
  const isOrders = pathname.startsWith("/admin/orders");
  const isPayments = pathname.startsWith("/admin/payments");
  const isRefunds = pathname.startsWith("/admin/refunds-cancellations");
  const isCustomers = pathname.startsWith("/admin/customers");
  const isB2B = pathname.startsWith("/admin/b2b");
  const isIntegrations = pathname.startsWith("/admin/integrations");
  const isInsights = pathname.startsWith("/admin/insights");
  const isReports = pathname.startsWith("/admin/reports");
  const isSettings = pathname.startsWith("/admin/settings");
  const isProfile = pathname.startsWith("/admin/profile");
  const isManagementPage =
    isProducts ||
    isInventory ||
    isOrders ||
    isPayments ||
    isRefunds ||
    isCustomers ||
    isB2B ||
    isIntegrations ||
    isInsights ||
    isReports ||
    isSettings ||
    isProfile;
  const heading = isProfile
    ? routeHeadings.profile
    : isSettings
      ? routeHeadings.settings
      : isReports
        ? routeHeadings.reports
        : isInsights
          ? routeHeadings.insights
          : isIntegrations
            ? routeHeadings.integrations
            : isB2B
              ? routeHeadings.b2b
              : isCustomers
                ? routeHeadings.customers
                : isRefunds
                  ? routeHeadings.refunds
                  : isPayments
                    ? routeHeadings.payments
                    : isOrders
                      ? routeHeadings.orders
                      : isInventory
                        ? routeHeadings.inventory
                        : isProducts
                          ? routeHeadings.products
                          : routeHeadings.dashboard;
  const currentDate = getCurrentAdminDate();

  const isActive = (href?: string) => {
    if (!href) return false;
    return href === "/admin" ? pathname === href : pathname.startsWith(href);
  };

  const showNotice = (label: string) => {
    setNotice(`${label} bölümü yakında kullanıma açılacak.`);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        profileMenuRef.current
          ?.querySelector<HTMLButtonElement>("[aria-haspopup='menu']")
          ?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  const handleProfileMenuKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("[role='menuitem']"),
    );
    if (!items.length) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <div className={styles.adminShell} data-admin-shell>
      {menuOpen && (
        <button
          className={styles.scrim}
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.logo}>
          <span>SOFİSTİKE</span>
          <strong>
            <i>+</i>XTRA
          </strong>
        </div>
        <nav aria-label="Yönetim menüsü">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={isActive(item.href) ? styles.activeNav : ""}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => showNotice(item.label)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ),
          )}
        </nav>
        <button
          className={styles.helpBox}
          type="button"
          onClick={() => showNotice("Destek Merkezi")}
        >
          <Icon name="help" />
          <span>
            Yardıma mı ihtiyacınız var?<strong>Destek Merkezi ↗</strong>
          </span>
        </button>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Menüyü aç"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className={styles.titleBlock}>
            <h1>{heading.title}</h1>
            <p>{heading.description}</p>
          </div>
          <time dateTime={currentDate.dateTime} suppressHydrationWarning>
            <Icon name="calendar" />
            {currentDate.label}
          </time>
          <div className={styles.tools}>
            {!isManagementPage && (
              <button
                type="button"
                className={styles.dateFilter}
                onClick={() => showNotice("Tarih filtresi")}
              >
                <Icon name="calendar" />
                <span>Son 30 Gün</span>
                <Icon name="chevron" />
              </button>
            )}
            <label className={styles.search}>
              <span className={styles.srOnly}>Genel arama</span>
              <input type="search" placeholder="Ara..." />
              <Icon name="search" />
            </label>
            <button
              type="button"
              className={styles.notification}
              aria-label="3 yeni bildirim"
              onClick={() => showNotice("Bildirimler")}
            >
              <Icon name="bell" />
              <span>3</span>
            </button>
            <div className={styles.profileMenuWrap} ref={profileMenuRef}>
              <button
                type="button"
                className={styles.profile}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                aria-controls="admin-profile-menu"
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <span className={styles.avatar}>AY</span>
                <span>Admin</span>
                <Icon name="chevron" />
              </button>
              {profileMenuOpen && (
                <div
                  id="admin-profile-menu"
                  className={styles.profileDropdown}
                  role="menu"
                  aria-label="Profil seçenekleri"
                  onKeyDown={handleProfileMenuKeyDown}
                >
                  <Link
                    href="/admin/profile"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Icon name="customers" /> Profilim
                  </Link>
                  <Link
                    href="/admin/settings"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Icon name="settings" /> Ayarlar
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.logoutItem}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                  >
                    <Icon name="returns" /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {notice && (
          <div className={styles.toast} role="status">
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Bildirimi kapat"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </main>
      {logoutModalOpen && (
        <AdminConfirmModal
          eyebrow="Oturum güvenliği"
          title="Çıkış yapmak istiyor musunuz?"
          description="Yönetim panelindeki aktif oturumunuz kapatılacak. Bu demo sürümünde yalnızca arayüz durumu güncellenir."
          confirmLabel="Çıkış Yap"
          danger
          onCancel={() => setLogoutModalOpen(false)}
          onConfirm={() => {
            setLogoutModalOpen(false);
            setNotice("Çıkış işlemi demo ortamında tamamlandı.");
          }}
        />
      )}
    </div>
  );
}
