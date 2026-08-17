import type { Metadata } from "next";
import { ReviewsPage } from "@/features/account/reviews-page";

export const metadata: Metadata = {
  title: "Değerlendirmelerim",
  description: "Sofistike +XTRA değerlendirme merkezi tasarım önizlemesi.",
};

export default function ReviewsRoute() {
  return <ReviewsPage />;
}
