"use client";

import Link from "next/link";
import { useCart } from "./cart-context";
import styles from "@/components/layout/site-header.module.css";

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      aria-label={itemCount ? `Sepet, ${itemCount} ürün` : "Sepet"}
      className={styles.actionLink}
      href="/?cart=open"
    >
      <BagIcon />
      {itemCount ? (
        <span className={styles.cartCount} aria-hidden="true">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
