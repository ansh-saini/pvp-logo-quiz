import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { Query } from "node-appwrite";
import { database, users } from "server/appwrite";
import { Room } from "utils/models";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "GET") {
      const { code } = req.query;
      const { documents } = await database.listDocuments<Room>(
        Collections.Room,
        [Query.equal("code", code)]
      );
      const room = documents[0];

      const data = [];
      for (const playerId of room.players) {
        const { name, $id } = await users.get(playerId);
        data.push({
          $id,
          name,
        });
      }

      resolve();
      return res.status(200).json({ data });
    }

    resolve();
  });
}
