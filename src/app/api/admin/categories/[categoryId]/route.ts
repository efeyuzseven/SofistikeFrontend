import { NextRequest, NextResponse } from "next/server";
import {
  API_BASE_URL,
  AUTH_COOKIE_NAME,
  getBackendErrorMessage,
} from "@/lib/auth";

function unauthorizedResponse() {
  return NextResponse.json(
    { message: "Yönetim panelini kullanmak için giriş yapın." },
    { status: 401 },
  );
}

async function proxyMutation(
  request: NextRequest,
  context: RouteContext<"/api/admin/categories/[categoryId]">,
  method: "PUT" | "DELETE",
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return unauthorizedResponse();

  const { categoryId } = await context.params;
  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/v1/admin/categories/${encodeURIComponent(categoryId)}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(method === "PUT" ? { "Content-Type": "application/json" } : {}),
        },
        body: method === "PUT" ? await request.text() : undefined,
        cache: "no-store",
      },
    );

    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

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
      { message: "Kategori yönetim servisine ulaşılamıyor." },
      { status: 503 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/admin/categories/[categoryId]">,
) {
  return proxyMutation(request, context, "PUT");
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/admin/categories/[categoryId]">,
) {
  return proxyMutation(request, context, "DELETE");
}
