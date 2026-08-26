import { handleSsoCallback } from "@hams-fam/sso-client/web";

export async function GET(request) {
  return handleSsoCallback(request);
}
