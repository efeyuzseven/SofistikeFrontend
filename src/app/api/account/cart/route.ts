import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { BackendCart } from "@/lib/cart";

async function forward(request: NextRequest, method: "GET" | "POST") {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Sepetinizi görüntülemek için giriş yapın." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/account/cart${method === "POST" ? "/items" : ""}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        },
        body: method === "POST" ? await request.text() : undefined,
        cache: "no-store",
      },
    );
    const payload = (await backendResponse.json().catch(() => null)) as
      BackendCart | unknown;

    if (!backendResponse.ok) {
      const response = NextResponse.json(
        { message: getBackendErrorMessage(payload) },
        { status: backendResponse.status },
      );
      if (backendResponse.status === 401)
        response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    return NextResponse.json(payload as BackendCart);
  } catch {
    return NextResponse.json(
      { message: "Sepet servisine ulaşılamıyor. Lütfen tekrar deneyin." },
      { status: 503 },
    );
  }
}

export async function GET(request: NextRequest) {
  return forward(request, "GET");
}

export async function POST(request: NextRequest) {
  return forward(request, "POST");
}
