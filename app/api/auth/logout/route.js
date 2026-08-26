import { handleSsoLogout } from "@hams-fam/sso-client/web";

export async function GET(request) {
  const response = await handleSsoLogout(request);
  const location = response.headers.get("location");

  if (!location) return response;

  const logoutUrl = new URL(location);
  logoutUrl.searchParams.set("redirect_to_service", "true");

  const headers = new Headers(response.headers);
  headers.set("location", logoutUrl.toString());
  return new Response(response.body, { status: response.status, headers });
}
