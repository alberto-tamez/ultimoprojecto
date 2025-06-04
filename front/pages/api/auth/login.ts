import { WorkOS } from "@workos-inc/node";
import type { NextApiRequest, NextApiResponse } from "next";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authorizationUrl = workos.sso.getAuthorizationUrl({
    organization: process.env.WORKOS_ORG_ID!,
    redirectUri: process.env.WORKOS_REDIRECT_URI!,
    clientId: process.env.WORKOS_CLIENT_ID!,
  });

  res.redirect(authorizationUrl);
}