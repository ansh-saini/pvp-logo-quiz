import { Collections } from "global/appwrite";
import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "server/appwrite";
import { filterPlayerDataKeys, parseRoomState } from "utils/helpers";
import { Room } from "utils/models";

/**
 * Calculates score for each player in the room and determines the winner.
 * There are three factors which determine a player's score. Each factor has a weight assigned to it. Shown below in brackets
 * 1. Correct answers (1000)
 * 2. Total questions attempted (10)
 * 3. Time taken (in seconds) to complete the round (-1)
 *
 * By calculating and adding all the above values we get a final score. **Highest score wins**.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  return new Promise<void>(async (resolve) => {
    if (req.method === "GET") {
      const WEIGHTS = {
        correct: 1000,
        attempted: 10,
        timeTaken: -1,
      };
      const MAX_TIME_PENALTY = 30;

      let { roomId } = req.query;

      if (Array.isArray(roomId)) roomId = roomId[0];

      const rawRoom = await database.getDocument<Room>(
        Collections.Room,
        roomId
      );
      const room = parseRoomState(rawRoom);

      const data = filterPlayerDataKeys(room)
        .map((player) => {
          const responses = Object.values(room[player] || {});

          if (responses.length === 0) {
            return {
              player,
              correct: 0,
              totalAnswered: 0,
              totalTime: 0,
              score: 0,
            };
          }

          const correct = responses.filter(({ isCorrect }) => isCorrect).length;
          const totalAnswered = responses.length;
          const totalTime =
            responses[responses.length - 1].timeStamp -
              responses[0].timeStamp || 0;

          // Converting time to seconds before calculating penalty
          const timePenalty = Math.min(totalTime / 1000, MAX_TIME_PENALTY);

          const obj = {
            // responses, (for timeline feature)
            player,
            correct,
            totalAnswered,
            totalTime,
            score:
              correct * WEIGHTS.correct +
              totalAnswered * WEIGHTS.attempted +
              timePenalty * WEIGHTS.timeTaken,
          };

          return obj;
        })
        // Sort by score (descending)
        .sort((a, b) => b.score - a.score);

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
