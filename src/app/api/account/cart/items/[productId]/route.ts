import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { BackendCart } from "@/lib/cart";

type RouteContext = { params: Promise<{ productId: string }> };

async function forward(
  request: NextRequest,
  context: RouteContext,
  method: "PATCH" | "DELETE",
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Sepetinizi düzenlemek için giriş yapın." },
      { status: 401 },
    );
  }

  const { productId } = await context.params;
  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/account/cart/items/${encodeURIComponent(productId)}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(method === "PATCH" ? { "Content-Type": "application/json" } : {}),
        },
        body: method === "PATCH" ? await request.text() : undefined,
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  return forward(request, context, "PATCH");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return forward(request, context, "DELETE");
}
