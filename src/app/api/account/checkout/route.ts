import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { CreatedOrder } from "@/lib/cart";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Sipariş oluşturmak için giriş yapın." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/account/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: await request.text(),
        cache: "no-store",
      },
    );
    const payload = (await backendResponse.json().catch(() => null)) as
      CreatedOrder | unknown;

    if (!backendResponse.ok) {
      const response = NextResponse.json(
        { message: getBackendErrorMessage(payload) },
        { status: backendResponse.status },
      );
      if (backendResponse.status === 401)
        response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    return NextResponse.json(payload as CreatedOrder, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Sipariş servisine ulaşılamıyor. Lütfen tekrar deneyin." },
      { status: 503 },
    );
  }
}
