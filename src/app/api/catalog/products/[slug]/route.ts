import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, getBackendErrorMessage } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/catalog/products/[slug]">,
) {
  const { slug } = await context.params;

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/products/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    const payload = (await backendResponse.json().catch(() => null)) as unknown;

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: getBackendErrorMessage(payload) },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Ürün detay servisine ulaşılamıyor." },
      { status: 503 },
    );
  }
}
