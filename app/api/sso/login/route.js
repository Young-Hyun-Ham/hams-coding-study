import { handleSsoLogin } from "@hams-fam/sso-client/web";

export async function GET(request) {
  return handleSsoLogin(request);
}
