import { handleAuthMe } from "@hams-fam/sso-client/web";

export async function GET(request) {
  return handleAuthMe(request);
}
