import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/account/orders/[orderId]/cancel">,
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Siparişi iptal etmek için giriş yapın." },
      { status: 401 },
    );
  }

  const { orderId } = await context.params;
  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/account/orders/${encodeURIComponent(orderId)}/cancel`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (!backendResponse.ok) {
      const payload = (await backendResponse
        .json()
        .catch(() => null)) as unknown;
      const response = NextResponse.json(
        { message: getBackendErrorMessage(payload) },
        { status: backendResponse.status },
      );
      if (backendResponse.status === 401) {
        response.cookies.delete(AUTH_COOKIE_NAME);
      }
      return response;
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "Sipariş servisine ulaşılamıyor." },
      { status: 503 },
    );
  }
}
