import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "products"
  | "stock"
  | "orders"
  | "payments"
  | "returns"
  | "customers"
  | "b2b"
  | "integrations"
  | "insights"
  | "reports"
  | "settings"
  | "search"
  | "bell"
  | "sales"
  | "cart"
  | "alert"
  | "calendar"
  | "chevron"
  | "menu"
  | "truck"
  | "refresh"
  | "card"
  | "comment"
  | "trend"
  | "help";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </>
  ),
  products: (
    <>
      <path d="M5 4h14l-1 17H6L5 4Z" />
      <path d="M9 8a3 3 0 0 0 6 0" />
    </>
  ),
  stock: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3V1m6 2V1M8 8h8m-8 4h8m-8 4h5" />
    </>
  ),
  orders: (
    <>
      <path d="M3 5h2l2 11h11l2-8H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </>
  ),
  payments: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  returns: (
    <>
      <path d="M4 10a8 8 0 1 1 2 8" />
      <path d="M4 4v6h6" />
    </>
  ),
  customers: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  b2b: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
    </>
  ),
  integrations: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
    </>
  ),
  insights: (
    <>
      <path d="M4 20v-5m5 5V9m5 11v-7m5 7V4" />
      <path d="m3 12 5-5 5 3 6-7" />
    </>
  ),
  reports: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 17v-4m4 4V8m4 9v-6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.5 1a8 8 0 0 0-1.8-1L14.2 3h-4.4l-.4 3.1a8 8 0 0 0-1.8 1l-2.5-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.5-1a8 8 0 0 0 1.8 1l.4 3.1h4.4l.4-3.1a8 8 0 0 0 1.8-1l2.5 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4" />
    </>
  ),
  sales: (
    <>
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 5h2l2 11h11l2-8H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6m0 4h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  truck: (
    <>
      <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5M6 8a7 7 0 0 1 12-2l2 2M18 16a7 7 0 0 1-12 2l-2-2" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  comment: <path d="M21 12a8 8 0 0 1-8 8H5l-3 2 1-5a9 9 0 1 1 18-5Z" />,
  trend: (
    <>
      <path d="m3 17 6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1 .7-1.7 1.2-1.7 2.8m0 3h.01" />
    </>
  ),
};

export function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
