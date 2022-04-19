// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Collections } from "global/appwrite";
import { nanoid } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { Models } from "node-appwrite";
import { database } from "server/appwrite";
import { Logo, Room } from "utils/models";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const userId = req.body.owner;
  database
    .createDocument<Room>(
      Collections.Room,
      "unique()",
      {
        code: nanoid(10),
        owner: userId,
        gameState: JSON.stringify({}),
        players: [userId],
      },
      [`user:${userId}`]
    )
    .then((room) => {
      getInitialGameState(room.$id)
        .then(() => {
          res.status(200).json({ code: room.code });
        })
        .catch(console.error);

      // console.log({ room });
      // promise
      //   .then((response) => {
      //     res.status(200).json(response);
      //   })
      //   .catch((err) => {
      //     res.status(400).json(err);
      //   });
    });
}

const getInitialGameState = (roomId: string) => {
  return database
    .listDocuments<Logo>(Collections.Logo, [], 10, 0)
    .then((questions) => {
      database.updateDocument(Collections.Room, roomId, {
        gameState: JSON.stringify(formatQuestions(questions)),
      });
    })
    .catch(console.error);
};

const formatQuestions = (questions: Models.DocumentList<Logo>) => {
  const obj: Record<string, any> = {};

  questions.documents.forEach((q) => {
    obj[q.$id] = {
      // Add options
      image: q.image,
      response: {},
    };
  });
  return obj;
};
