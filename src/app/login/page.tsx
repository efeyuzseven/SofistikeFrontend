import type { Metadata } from "next";
import { LoginPage } from "@/features/auth/login-page";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Sofistike +XTRA hesabınıza giriş yapın.",
};

export default function LoginRoute() {
  return <LoginPage />;
}
