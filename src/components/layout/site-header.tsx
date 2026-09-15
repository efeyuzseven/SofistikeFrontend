"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartLink } from "@/features/cart/cart-link";
import type { CatalogCategory, CategoryMenuGroup } from "@/lib/catalog";
import { AccountMenu } from "./account-menu";
import styles from "./site-header.module.css";

type HeaderMenuGroup = {
  label: string;
  menuGroup: CategoryMenuGroup;
  items: Array<Pick<CatalogCategory, "name" | "slug">>;
};

const fallbackMenuGroups: HeaderMenuGroup[] = [
  {
    label: "Shop by Solution",
    menuGroup: "Solution",
    items: [
      { name: "Sleep Better", slug: "sleep-better" },
      { name: "Allergy Care", slug: "allergy-care" },
      { name: "Home Reset", slug: "home-reset" },
      { name: "Laundry Care", slug: "laundry-care" },
      { name: "Bathroom Care", slug: "bathroom-care" },
      { name: "Kitchen Care", slug: "kitchen-care" },
      { name: "Pet Friendly", slug: "pet-friendly" },
      { name: "Healthy Living", slug: "healthy-living" },
      { name: "Organization", slug: "organization" },
    ],
  },
  {
    label: "Shop by Room",
    menuGroup: "Room",
    items: [
      { name: "Bedroom", slug: "bedroom" },
      { name: "Bathroom", slug: "bathroom" },
      { name: "Living Room", slug: "living-room" },
      { name: "Kitchen", slug: "kitchen-room" },
      { name: "Laundry Room", slug: "laundry-room" },
      { name: "Kids Room", slug: "kids-room" },
      { name: "Guest Room", slug: "guest-room" },
      { name: "Pet Area", slug: "pet-area" },
      { name: "Travel", slug: "travel" },
    ],
  },
  {
    label: "Shop by Category",
    menuGroup: "Category",
    items: [
      { name: "Uyku", slug: "uyku" },
      { name: "Ev Tekstili", slug: "ev-tekstili" },
      { name: "Aroma", slug: "aroma" },
      { name: "Mutfak", slug: "mutfak" },
      { name: "Banyo", slug: "banyo" },
      { name: "Evcil Dostlar", slug: "evcil-dostlar" },
    ],
  },
];

const directLinks = {
  "New Arrivals": "/?menu=new-arrivals",
  "Best Sellers": "/#urunler",
  "Innovation Lab": "/#innovation-lab",
} as const;

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
  const [menuGroups, setMenuGroups] =
    useState<HeaderMenuGroup[]>(fallbackMenuGroups);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch("/api/catalog/categories", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Categories could not be loaded.");

        const categories = (await response.json()) as CatalogCategory[];
        if (cancelled) return;

        setMenuGroups(
          fallbackMenuGroups.map((group) => ({
            ...group,
            items: categories
              .filter((category) => category.menuGroup === group.menuGroup)
              .sort(
                (left, right) =>
                  left.displayOrder - right.displayOrder ||
                  left.name.localeCompare(right.name, "tr-TR"),
              )
              .map(({ name, slug }) => ({ name, slug })),
          })),
        );
      } catch {
        // Kategori servisi geçici olarak kullanılamazsa sabit menü korunur.
      }
    }

    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

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
                    <li key={item.slug}>
                      <Link href={`/kategori/${encodeURIComponent(item.slug)}`}>
                        {item.name}
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
                      <li key={item.slug}>
                        <Link
                          href={`/kategori/${encodeURIComponent(item.slug)}`}
                        >
                          {item.name}
                        </Link>
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
