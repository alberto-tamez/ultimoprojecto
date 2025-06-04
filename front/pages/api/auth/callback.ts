import { NextApiRequest, NextApiResponse } from "next";
import WorkOS from "@workos-inc/node";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (typeof code !== "string") {
    return res.status(400).send("Código inválido");
  }

  const { profile } = await workos.sso.getProfileAndToken({ code });
  console.log("Perfil recibido:", profile);

  res.status(200).json({ success: true, profile });
}