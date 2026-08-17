import type { Metadata } from "next";
import { FavoritesPage } from "@/features/account/favorites-page";

export const metadata: Metadata = {
  title: "Favorilerim",
  description: "Sofistike +XTRA favori ürünler tasarım önizlemesi.",
};

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
