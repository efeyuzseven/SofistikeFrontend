import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, getBackendErrorMessage } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/products${request.nextUrl.search}`,
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
      { message: "Ürün servisine ulaşılamıyor. Lütfen tekrar deneyin." },
      { status: 503 },
    );
  }
}
