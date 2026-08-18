import type { Metadata } from "next";
import { RegisterPage } from "@/features/auth/register-page";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "Sofistike +XTRA hesabınızı oluşturun.",
};

export default function RegisterRoute() {
  return <RegisterPage />;
}
