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

/**
 * TODO: Options generate file system se bhi kar skte hain.
 * Can do this for questions as well. Random file names utha ke Query me pass kar dunga. Ek sath 10 question aa jayenge.
 * Will shuffle them using JS then.
 * HMM
 * console.time laga ke dekhunga which one is faster
 * ORRR
 * I can just list all logos DB se. 2-3K entries aa jayengi kitna he time lagega. Instead of this randomizer shit which hits the DB like 50 times (if you include options)
 *
 * @param roomId
 * @returns
 */
const getInitialGameState = async (roomId: string) => {
  // Get total entries
  let count = 0;
  const NUMBER_OF_QUESTIONS = 10;
  const questions: Models.DocumentList<Logo> = {
    total: 10,
    documents: [],
  };
  const generatedInts: number[] = [];

  while (questions.documents.length < NUMBER_OF_QUESTIONS) {
    count += 1;
    const randomInt = getRandomInt(0, questions.total);

    console.log(`Fetching entry number ${randomInt}`);
    const { total, documents } = await database.listDocuments<Logo>(
      Collections.Logo,
      [],
      1,
      randomInt
    );
    if (generatedInts.includes(randomInt)) {
      continue;
    }

    questions.documents.push(documents[0]);
    questions.total = total;
    generatedInts.push(randomInt);
    console.log(total, documents.length, questions.documents.length);
  }

  console.log(`Loop ran ${count} times`);

  console.log(`Returning with ${questions.documents.length} questions`);
  return database.updateDocument(Collections.Room, roomId, {
    gameState: JSON.stringify(formatQuestions(questions)),
  });
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

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);

  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min) + min);
}
