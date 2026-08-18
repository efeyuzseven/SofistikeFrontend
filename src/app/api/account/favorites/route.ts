import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { BackendPagedFavorites } from "@/lib/favorites";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Favorilerinizi görüntülemek için giriş yapın." },
      { status: 401 },
    );
  }

  const backendUrl = new URL(`${API_BASE_URL}/api/v1/account/favorites`);
  backendUrl.search = request.nextUrl.search;

  try {
    const backendResponse = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = (await backendResponse.json().catch(() => null)) as
      BackendPagedFavorites | unknown;

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

    return NextResponse.json(payload as BackendPagedFavorites);
  } catch {
    return NextResponse.json(
      { message: "Favori servisine ulaşılamıyor. Lütfen tekrar deneyin." },
      { status: 503 },
    );
  }
}
