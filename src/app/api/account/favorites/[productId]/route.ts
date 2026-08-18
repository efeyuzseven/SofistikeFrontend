import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { BackendFavoriteItem } from "@/lib/favorites";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  return forwardFavoriteMutation(request, context, "POST");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return forwardFavoriteMutation(request, context, "DELETE");
}

async function forwardFavoriteMutation(
  request: NextRequest,
  context: RouteContext,
  method: "POST" | "DELETE",
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Favorilerinizi değiştirmek için giriş yapın." },
      { status: 401 },
    );
  }

  const { productId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(productId)) {
    return NextResponse.json(
      { message: "Geçersiz ürün bilgisi." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/account/favorites/${productId}`,
      {
        method,
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    const payload = (await backendResponse.json().catch(() => null)) as
      BackendFavoriteItem | unknown;

    if (!backendResponse.ok) {
      const response = NextResponse.json(
        { message: getBackendErrorMessage(payload) },
        { status: backendResponse.status },
      );
      if (backendResponse.status === 401) {
        response.cookies.delete(AUTH_COOKIE_NAME);
      }
      return response;
    }

    return method === "DELETE"
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(payload as BackendFavoriteItem, {
          status: backendResponse.status,
        });
  } catch {
    return NextResponse.json(
      { message: "Favori servisine ulaşılamıyor. Lütfen tekrar deneyin." },
      { status: 503 },
    );
  }
}
