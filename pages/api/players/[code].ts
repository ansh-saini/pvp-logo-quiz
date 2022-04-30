import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { Query } from "node-appwrite";
import { database, users } from "server/appwrite";
import { Room } from "utils/models";

/**
 * API to list the names of players in a room.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "GET") {
      const { code } = req.query;
      const { documents } = await database.listDocuments<Room>(
        Collections.Room,
        [Query.equal("code", code)]
      );
      const room = documents[0];

      const data: Record<string, string> = {};
      // Mapping playerId with their name
      for (const playerId of room.players) {
        const { name, $id } = await users.get(playerId);
        data[$id] = name;
      }

      resolve();
      return res.status(200).json({ data });
    }

    resolve();
  });
}
