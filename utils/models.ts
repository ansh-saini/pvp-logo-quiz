import { Models } from "node-appwrite";

export interface Logo extends Models.Document {
  name: string;
  image: string;
}

type ResponseData = {
  response: string;
  isCorrect: boolean;
  // Time of marking the answer (used to calculate how who won)
  timeStamp: number;
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
   * Status of the room.
   */
  status: "started" | "completed" | "lobby";
  /**
   * Time when status changed to "started"
   * Date.now()
   */
  startTime: number | undefined;
  /**
   * A JSON representing the state of the game.
   * Stores the questions that were generated for a particular game.
   */
  gameState: string | undefined;
  /**
   * Array of userIds who will be participating in the game
   * The (index + 1) represents player number.
   * [user1, user2] -> user1 = p1, user2 = p2
   */
  players: [string, string];
  /**
   * Responses of player1 (The owner)
   */
  p1: string | undefined;
  /**
   * Responses of player2
   */
  p2: string | undefined;
}

export type ParsedRoom = Omit<Room, "gameState" | "p1" | "p2"> & {
  // Array of questions
  gameState: {
    [key: string]: {
      image: string;
      options: string[];
    };
  };
  // questionId: response
  p1: { [key: string]: ResponseData } | undefined;
  // questionId: response
  p2: { [key: string]: ResponseData } | undefined;
};

export type Question = Logo & { options: string[] };
