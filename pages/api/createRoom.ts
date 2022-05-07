import { Collections } from "global/appwrite";
import { nanoid } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { Models } from "node-appwrite";
import { database } from "server/appwrite";
import { getRandomInt } from "utils/helpers";
import { Logo, Question, Room } from "utils/models";

/**
 * This API is responsible for creating rooms.
 * Generates a unique room code.
 * Gives read access to the creator of the room.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
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
          res.status(200).json({ code: room.code });
        });
    }

    return resolve();
  });
}

/**
 * This function is responsible for generating the questions for each game
 * It generates the questions and options by loading the list of all logos and then randomly selecting indices from that list.
 * Also adds the correct answer in the list of options of the respective question.
 * Duplicates are never produced.
 */
export const getInitialGameState = async () => {
  const logos = await getAllLogos();

  const getWrongOptions = (correctOption: string) => {
    const NUMBER_OF_OPTIONS = 3;
    const options: number[] = [];
    const generatedInts: number[] = [];
    let count = 0;

    while (options.length < NUMBER_OF_OPTIONS) {
      count += 1;
      const randomInt = getRandomInt(0, questions.total);

      if (generatedInts.includes(randomInt)) {
        // console.log(`Returning ${randomInt}`);
        continue;
      }

      /**
       * We cannot add the correct answer to the random options list.
       * We add it manually after this function is called.
       */
      if (logos[randomInt].name === correctOption) continue;

      options.push(randomInt);
      generatedInts.push(randomInt);
    }
    // console.log(`Options loop ran ${count} times`);

    return options;
  };

  let count = 0;
  const NUMBER_OF_QUESTIONS = 10;
  const questions: Models.DocumentList<Question> = {
    total: logos.length,
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
    // Converting indices to names
    q.options = getWrongOptions(q.name).map((idx) => logos[idx].name);
    // Inserting correct answer at a random index
    q.options.splice(getRandomInt(0, q.options.length), 0, q.name);

    questions.documents.push(q);
    generatedInts.push(randomInt);
    // console.log(total, documents.length, questions.documents.length);
  }

  // console.log(`Questions loop ran ${count} times`);
  // console.log(`Returning with ${questions.documents.length} questions`);

  return formatQuestions(questions);
};

const getAllLogos = async () => {
  let logos: Logo[] = [];

  let res = await database.listDocuments<Logo>(
    Collections.Logo,
    undefined,
    100
  );

  while (logos.length < res.total) {
    logos = [...logos, ...res.documents];

    res = await database.listDocuments<Logo>(
      Collections.Logo,
      undefined,
      100,
      logos.length
    );

    console.log(`Loaded ${logos.length} logos into memory`);
  }

  return logos;
};

/**
 * Strips out any additional data from the Question which is not required
 */
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
