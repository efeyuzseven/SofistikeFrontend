import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";
import type { AccountProfile } from "@/lib/auth";

type UpdateProfileBody = {
  firstName?: unknown;
  lastName?: unknown;
  phoneNumber?: unknown;
};

export async function GET(request: NextRequest) {
  return forwardProfileRequest(request, "GET");
}

export async function PUT(request: NextRequest) {
  let body: UpdateProfileBody;

  try {
    body = (await request.json()) as UpdateProfileBody;
  } catch {
    return NextResponse.json(
      { message: "Geçersiz profil isteği." },
      { status: 400 },
    );
  }

  if (
    typeof body.firstName !== "string" ||
    (body.lastName !== null && typeof body.lastName !== "string") ||
    (body.phoneNumber !== null && typeof body.phoneNumber !== "string")
  ) {
    return NextResponse.json(
      { message: "Profil bilgilerini kontrol edip tekrar deneyin." },
      { status: 400 },
    );
  }

  return forwardProfileRequest(request, "PUT", {
    firstName: body.firstName.trim(),
    lastName: body.lastName?.trim() || null,
    phoneNumber: body.phoneNumber?.trim() || null,
  });
}

async function forwardProfileRequest(
  request: NextRequest,
  method: "GET" | "PUT",
  body?: {
    firstName: string;
    lastName: string | null;
    phoneNumber: string | null;
  },
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Profil bilgilerinize erişmek için giriş yapın." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/account/profile`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
      },
    );
    const payload = (await backendResponse.json().catch(() => null)) as
      AccountProfile | unknown;

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

    return NextResponse.json({ profile: payload as AccountProfile });
  } catch {
    return NextResponse.json(
      { message: "Profil servisine ulaşılamıyor. Lütfen tekrar deneyin." },
      { status: 503 },
    );
  }
}
