import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "server/appwrite";
import { parseRoomState, SafeKeys } from "utils/helpers";
import { Logo, ResponseData, Room } from "utils/models";

/**
 * API to save user's response for the question
 * Also calculates if the response was correct or not.
 *
 * User may have skipped the question (maybe the time ran out), in that case we get `isSkipped: true`
 *
 * Also checks if all players have answered all questions.
 * In that case, game is over for everyone and we can now show the users the result page.
 *
 * (We cannot show the result page until all players have finished because
 * we need to calculate the final scores of each player before determining the winner)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
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

      const isGameOverForAllPlayers = () => {
        const statues = room.players.map((localPlayerId) => {
          const playerIndex = `p${
            room.players.indexOf(localPlayerId) + 1
          }` as SafeKeys;
          const responses =
            // When we're checking current user's data we need to check the latest data.
            localPlayerId === playerId
              ? updatedPlayerData
              : JSON.parse(room[playerIndex] || "{}");

          const noOfQuestions = Object.keys(gameState).length;

          // If all questions have a response object associated with them, that means user has gone through all the questions
          return responses && Object.keys(responses).length === noOfQuestions;
        });

        return statues.every((gameOver) => gameOver === true);
      };

      try {
        await database.updateDocument<Room>(Collections.Room, roomId, {
          [playerIndex]: JSON.stringify(updatedPlayerData),
          status: isGameOverForAllPlayers() ? "completed" : room.status,
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
