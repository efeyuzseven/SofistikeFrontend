export const AUTH_COOKIE_NAME = "sofistike_session";

export const API_BASE_URL = (
  process.env.API_BASE_URL ?? "http://localhost:5118"
).replace(/\/$/, "");

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  role: string;
};

export type BackendLoginResponse = {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
};

export function getBackendErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "detail" in payload &&
    typeof payload.detail === "string"
  ) {
    return payload.detail;
  }

  return "İşlem şu anda tamamlanamadı. Lütfen tekrar deneyin.";
}
