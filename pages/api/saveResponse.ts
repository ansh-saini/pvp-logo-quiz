// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "server/appwrite";
import { parseRoomState, SafeKeys } from "utils/helpers";
import { Logo, ResponseData, Room } from "utils/models";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "POST") {
      // TODO: Add authentication check here. We shouldn't be taking playerId in request.

      const { roomId, playerId, questionId, response, timeStamp, isSkipped } =
        req.body;

      const room = await database.getDocument<Room>(Collections.Room, roomId);
      const { name: correctAnswer } = await database.getDocument<Logo>(
        Collections.Logo,
        questionId
      );

      // p1, p2, p3 etc...
      const playerIndex = `p${room.players.indexOf(playerId) + 1}` as
        | "p1"
        | "p2";

      const playerState = JSON.parse(room[playerIndex] || "{}");

      const updatedPlayerData: { [key: string]: ResponseData } = {
        ...playerState,
        [questionId]: {
          response,
          // Check correct answer
          isCorrect: response === correctAnswer,
          timeStamp,
          isSkipped: isSkipped || false,
        },
      };
      const { gameState } = parseRoomState(room);

      const isGameOver = () => {
        const statues = room.players.map((localPlayerId) => {
          const playerIndex = `p${
            room.players.indexOf(localPlayerId) + 1
          }` as SafeKeys;
          const responses =
            localPlayerId === playerId
              ? updatedPlayerData
              : JSON.parse(room[playerIndex] || "{}");

          const noOfQuestions = Object.keys(gameState).length;

          // Game over
          return responses && Object.keys(responses).length === noOfQuestions;
        });

        return statues.every((bool) => bool === true);
      };

      const gameOverForAllPlayers = isGameOver();

      try {
        await database.updateDocument<Room>(Collections.Room, roomId, {
          [playerIndex]: JSON.stringify(updatedPlayerData),
          status: gameOverForAllPlayers ? "completed" : room.status,
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
