import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { Query } from "node-appwrite";
import { database } from "server/appwrite";
import { getCurrentUser } from "server/utils";
import { MAX_PLAYERS } from "utils/config";
import { Room } from "utils/models";
import { getInitialGameState } from "../createRoom";

/**
 * Handles new/existing players joining the room
 * Generates questions when the final player is about to join
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "POST") {
      const { user, error } = await getCurrentUser(req.headers);

      if (!user || error) {
        return res.status(401).json(error);
      }
      const playerId = user.$id;

      const { code } = req.query;

      const { documents } = await database.listDocuments<Room>(
        Collections.Room,
        [Query.equal("code", code)]
      );
      const room = documents[0];

      if (!room) {
        resolve();
        return res.status(404).json({ roomNotFound: true });
      }
      const roomId = room.$id;

      // Player had already joined once before.
      if (room.players.includes(playerId)) {
        resolve();
        return res.status(200).json({ joined: true });
      }

      // Room is full.
      if (room.players.length >= MAX_PLAYERS) {
        resolve();
        return res.status(400).json({ roomFull: true });
      }

      // If room capacity was 2, and there was 1 player already in the room, then we know that this is the final player who is about to join
      const finalPlayerJoining = room.players.length === MAX_PLAYERS - 1;

      // Generate questions and mark room as started
      const gameState = finalPlayerJoining ? await getInitialGameState() : {};
      const roomStatus: Room["status"] = finalPlayerJoining
        ? "started"
        : "lobby";

      // Add user to the room
      await database.updateDocument<Room>(
        Collections.Room,
        roomId,
        {
          players: [...room.players, playerId],
          gameState: JSON.stringify(gameState),
          status: roomStatus,
          startTime: Date.now(),
        },
        // Give read access to the new player
        [...room.$read, `user:${playerId}`]
      );

      resolve();
      return res
        .status(200)
        .json({ joined: true, started: finalPlayerJoining });
    }

    resolve();
  });
}
