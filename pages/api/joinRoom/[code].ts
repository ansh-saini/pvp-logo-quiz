// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { Query } from "node-appwrite";
import { database } from "server/appwrite";
import { Room } from "utils/models";
import { getInitialGameState } from "../createRoom";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "POST") {
      // TODO: Add authentication check here. We shouldn't be taking playerId in request.

      const { code } = req.query;
      const { userId } = req.body;

      const { documents } = await database.listDocuments<Room>(
        Collections.Room,
        [Query.equal("code", code)]
      );
      const room = documents[0];
      const roomId = room.$id;

      if (room.players.includes(userId)) {
        resolve();
        return res.status(200).json({ joined: true });
      }

      if (room.players.length >= 2) {
        resolve();
        return res.status(400).json({ roomFull: true });
      }

      const gameState = await getInitialGameState(roomId);

      // Add user to the room
      await database.updateDocument<Room>(
        Collections.Room,
        roomId,
        {
          players: [...room.players, userId],
          gameState: JSON.stringify(gameState),
          status: "started",
          startTime: Date.now(),
        },
        // Give read access to the new player
        [...room.$read, `user:${userId}`]
      );

      resolve();
      return res.status(200).json({ joined: true });
    }

    resolve();
  });
}
