// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "server/appwrite";
import { filterPlayerDataKeys, parseRoomState } from "utils/helpers";
import { Room } from "utils/models";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "GET") {
      const { roomId } = req.body;

      const rawRoom = await database.getDocument<Room>(
        Collections.Room,
        roomId
      );
      const room = parseRoomState(rawRoom);
      // if (room.winner) {
      //   resolve()
      //   return
      // }

      const data = filterPlayerDataKeys(room)
        .map((player) => {
          const responses = Object.values(room[player]);

          const correct = responses.filter(({ isCorrect }) => isCorrect).length;

          return {
            player,
            correct,
            totalAnswered: responses.length,
            totalTime:
              responses[responses.length - 1].timeStamp -
              responses[0].timeStamp,
          };
        })
        .map(
          ({ correct, totalAnswered, totalTime }) =>
            correct * 1000 + totalAnswered * 10 + -1 * totalTime,
          0
        );

      // Math.max(
      //   ...data.map(function (o) {
      //     return o.correct;
      //   })
      // );

      try {
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
