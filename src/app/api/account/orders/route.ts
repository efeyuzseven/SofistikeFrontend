import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Siparişlerinizi görmek için giriş yapın." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/account/orders`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    const payload = (await backendResponse.json().catch(() => null)) as unknown;
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

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Sipariş servisine ulaşılamıyor." },
      { status: 503 },
    );
  }
}
