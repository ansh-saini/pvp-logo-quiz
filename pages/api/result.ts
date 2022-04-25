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
      let { roomId } = req.query;

      if (Array.isArray(roomId)) roomId = roomId[0];

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
          const responses = Object.values(room[player] || {});

          const correct = responses.filter(({ isCorrect }) => isCorrect).length;

          const obj = {
            player,
            correct,
            totalAnswered: responses.length,
            totalTime:
              responses[responses.length - 1].timeStamp -
                responses[0].timeStamp || 0,
          };

          console.log(obj);

          return obj;
        })
        .map(({ correct, totalAnswered, totalTime, player }) => ({
          player,
          score: correct * 1000 + totalAnswered * 10 + (totalTime / 1000) * -1,
        }))
        .sort((a, b) => b.score - a.score);

      console.log(data);

      // Math.max(
      //   ...data.map(function (o) {
      //     return o.correct;
      //   })
      // );

      try {
        resolve();
        return res.status(200).json({ data });
      } catch (e) {
        console.error(e);
        resolve();
        return res.status(400).json({ errors: e });
      }
    }

    resolve();
  });
}
