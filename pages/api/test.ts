import type { NextApiRequest, NextApiResponse } from "next";

/**
 * This is just a test API to test any independent functions out of context.
 * Reduces testing time
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "GET") {
      resolve();
      res.status(200).json({ status: "ok" });
    }
  });
}
