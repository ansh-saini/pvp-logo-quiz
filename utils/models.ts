import { Models } from "node-appwrite";

export interface Logo extends Models.Document {
  name: string;
  image: string;
}

type PlayerData = {
  response: string;
  isCorrect: boolean;
};

export interface Room extends Models.Document {
  /**
   * A unique identifier for each room. Is used by clients to join rooms.
   */
  code: string;
  /**
   * ID of the user who created the room
   */
  owner: string;
  /**
   * A JSON representing the state of the game.
   * Stores the questions that were generated for a particular game.
   */
  gameState: string;
  /**
   * Array of userIds who will be participating in the game
   * The (index + 1) represents player number.
   * [user1, user2] -> user1 = p1, user2 = p2
   */
  players: [string, string];
  /**
   * Responses of player1 (The owner)
   */
  p1: string;
  /**
   * Responses of player2
   */
  p2: string;
}

export type ParsedRoom = Omit<Room, "gameState" | "p1" | "p2"> & {
  // Array of questions
  gameState: {
    [key: string]: {
      image: string;
      response: any;
      options: string[];
    };
  };
  // questionId: response
  p1: { [key: string]: PlayerData };
  // questionId: response
  p2: { [key: string]: PlayerData };
};

export type Question = Logo & { options: string[] };
