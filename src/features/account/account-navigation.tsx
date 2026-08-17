"use client";

import Link from "next/link";
import styles from "./account-navigation.module.css";

type AccountSection = "profile" | "orders" | "favorites" | "reviews";

const sections = [
  {
    id: "profile" as const,
    label: "Kullanıcı Bilgilerim",
    href: "/hesabim/bilgilerim",
  },
  {
    id: "orders" as const,
    label: "Siparişlerim",
    href: "/hesabim/siparislerim",
  },
  {
    id: "favorites" as const,
    label: "Favorilerim",
    href: "/hesabim/favorilerim",
  },
  {
    id: "reviews" as const,
    label: "Değerlendirmelerim",
    href: "/hesabim/degerlendirmelerim",
  },
  { id: "returns" as const, label: "İade Taleplerim" },
] as const;

function SectionIcon({ section }: { section: AccountSection }) {
  if (section === "orders") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 7.5h14v12H5zM8 7.5V5.8A3.6 3.6 0 0 1 11.6 2h.8A3.6 3.6 0 0 1 16 5.8v1.7" />
      </svg>
    );
  }

  if (section === "favorites") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>
    );
  }

  if (section === "reviews") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.6-4 3.1-6 7.5-6s6.9 2 7.5 6" />
    </svg>
  );
}

export function AccountNavigation({ active }: { active: AccountSection }) {
  const activeLabel = sections.find((section) => section.id === active)?.label;

  return (
    <>
      <aside className={styles.sidebar} aria-label="Hesap navigasyonu">
        <nav>
          {sections.map((section) =>
            "href" in section ? (
              <Link
                className={section.id === active ? styles.activeNavItem : ""}
                href={section.href}
                key={section.id}
              >
                {section.id === active ? (
                  <SectionIcon section={active} />
                ) : null}
                <span>{section.label}</span>
              </Link>
            ) : (
              <button type="button" disabled key={section.id}>
                <span>{section.label}</span>
                <small>Yakında</small>
              </button>
            ),
          )}
        </nav>
      </aside>

      <details className={styles.mobileNavigation}>
        <summary>
          <span>{activeLabel}</span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div>
          {sections.map((section) =>
            "href" in section ? (
              <Link href={section.href} key={section.id}>
                {section.label}
              </Link>
            ) : (
              <button type="button" disabled key={section.id}>
                {section.label} <small>Yakında</small>
              </button>
            ),
          )}
        </div>
      </details>
    </>
  );
}
