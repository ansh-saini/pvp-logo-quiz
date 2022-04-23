// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "server/appwrite";
import { Room } from "utils/models";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "POST") {
      const { roomId, playerId, questionId, response } = req.body;

      const room = await database.getDocument<Room>(Collections.Room, roomId);
      const roomState = JSON.parse(room.gameState);

      try {
        await database.updateDocument<Room>(Collections.Room, roomId, {
          gameState: JSON.stringify({
            ...roomState,
            [questionId]: {
              ...roomState[questionId],
              response: {
                ...roomState[questionId].response,
                [playerId]: {
                  value: response,
                },
              },
            },
          }),
        });
        return res.status(200).json({});
      } catch (e) {
        console.error(e);
        return res.status(400).json({ errors: e });
      }
    }

    resolve();
  });
}
