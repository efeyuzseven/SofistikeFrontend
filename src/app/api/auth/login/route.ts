import { NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { BackendLoginResponse } from "@/lib/auth";

type LoginBody = {
  email?: unknown;
  password?: unknown;
  rememberMe?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { message: "Geçersiz giriş isteği." },
      { status: 400 },
    );
  }

  if (
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    typeof body.rememberMe !== "boolean"
  ) {
    return NextResponse.json(
      { message: "E-posta adresi ve şifre zorunludur." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email.trim(),
        password: body.password,
        rememberMe: body.rememberMe,
      }),
      cache: "no-store",
    });
    const payload = (await backendResponse.json().catch(() => null)) as
      BackendLoginResponse | unknown;

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: getBackendErrorMessage(payload) },
        { status: backendResponse.status },
      );
    }

    const login = payload as BackendLoginResponse;
    const response = NextResponse.json({ user: login.user });
    response.cookies.set(AUTH_COOKIE_NAME, login.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(body.rememberMe ? { maxAge: login.expiresIn } : {}),
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Giriş servisine ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.",
      },
      { status: 503 },
    );
  }
}
