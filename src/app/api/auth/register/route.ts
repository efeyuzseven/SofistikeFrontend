import { NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { BackendLoginResponse } from "@/lib/auth";

type RegisterBody = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { message: "Geçersiz kayıt isteği." },
      { status: 400 },
    );
  }

  if (
    typeof body.email !== "string" ||
    typeof body.firstName !== "string" ||
    typeof body.password !== "string" ||
    (body.lastName !== null && typeof body.lastName !== "string")
  ) {
    return NextResponse.json(
      { message: "Kayıt bilgilerini kontrol edip tekrar deneyin." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: body.email.trim(),
          firstName: body.firstName.trim(),
          lastName: body.lastName?.trim() || null,
          password: body.password,
        }),
        cache: "no-store",
      },
    );
    const payload = (await backendResponse.json().catch(() => null)) as
      BackendLoginResponse | unknown;

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: getBackendErrorMessage(payload) },
        { status: backendResponse.status },
      );
    }

    const registration = payload as BackendLoginResponse;
    const response = NextResponse.json(
      { user: registration.user },
      { status: 201 },
    );
    response.cookies.set(AUTH_COOKIE_NAME, registration.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Kayıt servisine ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.",
      },
      { status: 503 },
    );
  }
}
