import { Models } from "node-appwrite";

export interface Logo extends Models.Document {
  image: string;
}

export interface Room extends Models.Document {
  code: string;
}
