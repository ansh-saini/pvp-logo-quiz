import { Models } from "node-appwrite";

export interface Logo extends Models.Document {
  image: string;
}

export interface Room extends Models.Document {
  code: string;
  gameState: string;
  owner: string;
  players: [string, string];
}

export type ParsedRoom = Omit<Room, "gameState"> & {
  // Array of questions
  gameState: {
    [key: string]: {
      image: string;
      response: any;
    };
  };
};
