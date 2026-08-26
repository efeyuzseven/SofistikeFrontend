import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Yönetim panelini kullanmak için giriş yapın." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/admin/products`,
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

    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Ürün yönetim servisine ulaşılamıyor." },
      { status: 503 },
    );
  }
}
