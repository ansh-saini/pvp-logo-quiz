// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Collections } from "global/appwrite";
import { database } from "server/appwrite";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req.body);

  const userId = req.body.owner;
  database.createDocument(
    Collections.Room,
    "unique()",
    {
      code: "3",
      owner: userId,
      gameState: JSON.stringify({}),
      players: [userId],
    },
    [`user:${userId}`]
  );
  const promise = getInitialGameState();
  promise
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}

const getInitialGameState = () => {
  return database.listDocuments(Collections.Logo);
};
