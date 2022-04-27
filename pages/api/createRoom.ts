// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Collections } from "global/appwrite";
import { nanoid } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { Models } from "node-appwrite";
import { database } from "server/appwrite";
import { Logo, Question, Room } from "utils/models";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise<void>((resolve) => {
    if (req.method === "POST") {
      const ownerId = req.body.owner;
      database
        .createDocument<Room>(
          Collections.Room,
          "unique()",
          {
            code: nanoid(10),
            owner: ownerId,
            gameState: JSON.stringify({}),
            players: [ownerId],
            status: "lobby",
          },
          [`user:${ownerId}`]
        )
        .then((room) => {
          // getInitialGameState(room.$id)
          //   .then(() => {
          res.status(200).json({ code: room.code });
          // })
          // .catch(console.error);
        });
    }

    return resolve();
  });
}

export const getInitialGameState = async (roomId: string) => {
  const { total, documents: logos } = await database.listDocuments<Logo>(
    Collections.Logo,
    undefined,
    100
  );

  const getOptions = () => {
    const NUMBER_OF_OPTIONS = 3;
    const a: number[] = [];
    const generatedInts: number[] = [];
    let count = 0;

    while (a.length < NUMBER_OF_OPTIONS) {
      count += 1;
      const randomInt = getRandomInt(0, questions.total);

      if (generatedInts.includes(randomInt)) {
        // console.log(`Returning ${randomInt}`);
        continue;
      }

      // console.log(`Adding ${randomInt}`);

      a.push(randomInt);
      generatedInts.push(randomInt);
    }
    console.log(`Options loop ran ${count} times`);

    return a;
  };

  // console.log(x);
  // Get total entries
  let count = 0;
  const NUMBER_OF_QUESTIONS = 10;
  const questions: Models.DocumentList<Question> = {
    total: total,
    documents: [],
  };
  const generatedInts: number[] = [];

  while (questions.documents.length < NUMBER_OF_QUESTIONS) {
    count += 1;
    const randomInt = getRandomInt(0, questions.total);

    // console.log(`Fetching entry number ${randomInt}`);

    if (generatedInts.includes(randomInt)) {
      continue;
    }

    const q: Question = { ...logos[randomInt], options: [] };
    q.options = getOptions().map((idx) => logos[idx].name);
    // Inserting correct answer at a random index
    q.options.splice(getRandomInt(0, q.options.length), 0, q.name);

    questions.documents.push(q);
    generatedInts.push(randomInt);
    // console.log(total, documents.length, questions.documents.length);
  }

  console.log(`Questions loop ran ${count} times`);
  console.log(`Returning with ${questions.documents.length} questions`);

  return formatQuestions(questions);
};

const formatQuestions = (questions: Models.DocumentList<Question>) => {
  const obj: Record<string, any> = {};

  questions.documents.forEach((q) => {
    obj[q.$id] = {
      options: q.options,
      image: q.image,
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
