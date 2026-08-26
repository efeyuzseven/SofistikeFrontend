import { NextResponse } from "next/server";
import { API_BASE_URL, getBackendErrorMessage } from "@/lib/auth";

export async function GET() {
  try {
    const backendResponse = await fetch(`${API_BASE_URL}/api/v1/categories`, {
      cache: "no-store",
    });
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
      { message: "Kategori servisine ulaşılamıyor. Lütfen tekrar deneyin." },
      { status: 503 },
    );
  }
}
