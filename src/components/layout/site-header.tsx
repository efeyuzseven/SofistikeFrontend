import Link from "next/link";
import { CartLink } from "@/features/cart/cart-link";
import { AccountMenu } from "./account-menu";
import styles from "./site-header.module.css";

const menuGroups = [
  {
    label: "Shop by Solution",
    items: [
      "Sleep Better",
      "Allergy Care",
      "Home Reset",
      "Laundry Care",
      "Bathroom Care",
      "Kitchen Care",
      "Pet Friendly",
      "Healthy Living",
      "Organization",
    ],
  },
  {
    label: "Shop by Room",
    items: [
      "Bedroom",
      "Bathroom",
      "Living Room",
      "Kitchen",
      "Laundry Room",
      "Kids Room",
      "Guest Room",
      "Pet Area",
      "Travel",
    ],
  },
  {
    label: "Shop by Category",
    items: [
      "Bedding",
      "Bath",
      "Home Fragrance",
      "Laundry",
      "Cleaning",
      "Kitchen",
      "Personal Care",
      "Storage & Organization",
      "Pet Care",
    ],
  },
] as const;

const directLinks = {
  "New Arrivals": "/?menu=new-arrivals",
  "Best Sellers": "/#urunler",
  "Innovation Lab": "/#innovation-lab",
} as const;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

function HeaderIcon({ name }: { name: "search" }) {
  const commonProps = {
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  };

  if (name === "search") {
    return (
      <svg {...commonProps}>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  return null;
}

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-label="Sofistike +XTRA">
      <span>SOFISTIKE</span>
      <strong>
        <i>+</i>XTRA
      </strong>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className={styles.siteHeader}>
      <div className={styles.utilityBar}>
        <p>Smart ideas for better living.</p>
        <nav aria-label="Yardımcı bağlantılar">
          <Link href="/?journey=business">Business Partner Login</Link>
          <Link href="/?section=rewards">Rewards</Link>
          <Link href="/?language=tr">TR</Link>
        </nav>
      </div>

      <div className={styles.headerMain}>
        <Link className={styles.logoLink} href="/" aria-label="Ana sayfa">
          <BrandMark />
        </Link>

        <nav className={styles.desktopNav} aria-label="Ana navigasyon">
          {menuGroups.map((group) => (
            <div className={styles.navGroup} key={group.label}>
              <button type="button" aria-haspopup="true">
                {group.label}
                <span aria-hidden="true">⌄</span>
              </button>
              <div className={styles.megaMenu}>
                <div>
                  <p>{group.label}</p>
                  <strong>Better choices for everyday living.</strong>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
                      <Link href={`/?menu=${toSlug(item)}`}>
                        {item}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {Object.entries(directLinks).map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            className={styles.actionLink}
            href="/?search=open"
            aria-label="Arama"
          >
            <HeaderIcon name="search" />
          </Link>
          <AccountMenu />
          <CartLink />

          <details className={styles.mobileMenu}>
            <summary aria-label="Menüyü aç veya kapat">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </summary>
            <div className={styles.mobilePanel}>
              {menuGroups.map((group) => (
                <details key={group.label} className={styles.mobileGroup}>
                  <summary>{group.label}</summary>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>
                        <Link href={`/?menu=${toSlug(item)}`}>{item}</Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
              {Object.entries(directLinks).map(([label, href]) => (
                <Link key={label} href={href}>
                  {label}
                </Link>
              ))}
              <div className={styles.mobileUtilityLinks}>
                <Link href="/?journey=business">Business Partner Login</Link>
                <Link href="/?section=rewards">Rewards</Link>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className={styles.colorRail} aria-hidden="true" />
    </header>
  );
}
