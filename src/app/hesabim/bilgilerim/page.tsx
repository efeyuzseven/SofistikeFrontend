import type { Metadata } from "next";
import { ProfilePage } from "@/features/account/profile-page";

export const metadata: Metadata = {
  title: "Kullanıcı Bilgilerim",
  description: "Sofistike +XTRA kullanıcı bilgileri tasarım önizlemesi.",
};

export default function ProfileRoute() {
  return <ProfilePage />;
}
