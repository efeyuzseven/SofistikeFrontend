import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, AUTH_COOKIE_NAME } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    const user = (await backendResponse.json()) as AuthUser;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { message: "Oturum servisine ulaşılamıyor." },
      { status: 503 },
    );
  }
}
