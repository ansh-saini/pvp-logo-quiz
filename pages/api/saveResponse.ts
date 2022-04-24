// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "server/appwrite";
import { Logo, Room } from "utils/models";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "POST") {
      // TODO: Add authentication check here. We shouldn't be taking playerId in request.

      const { roomId, playerId, questionId, response, timeStamp } = req.body;

      const room = await database.getDocument<Room>(Collections.Room, roomId);
      const { name: correctAnswer } = await database.getDocument<Logo>(
        Collections.Logo,
        questionId
      );

      // p1, p2, p3 etc...
      const playerIndex = `p${room.players.indexOf(playerId) + 1}` as
        | "p1"
        | "p2";
      const playerState = JSON.parse(room[playerIndex]);

      const updatedPlayerData = {
        ...playerState,
        [questionId]: {
          response,
          // Check correct answer
          isCorrect: response === correctAnswer,
          timeStamp,
        },
      };

      try {
        await database.updateDocument<Room>(Collections.Room, roomId, {
          [playerIndex]: JSON.stringify(updatedPlayerData),
        });
        resolve();
        return res.status(200).json({});
      } catch (e) {
        console.error(e);
        resolve();
        return res.status(400).json({ errors: e });
      }
    }

    resolve();
  });
}
