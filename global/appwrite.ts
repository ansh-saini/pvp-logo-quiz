import { Appwrite } from "appwrite";

export const Server = {
  endpoint: process.env.APPWRITE_ENDPOINT as string,
  project: process.env.APPWRITE_PROJECT as string,
} as const;

export const appwrite = new Appwrite()
  .setEndpoint(Server.endpoint)
  .setProject(Server.project);

export const Collections = {
  Room: process.env.APPWRITE_COLLECTION_ROOM as string,
  Logo: process.env.APPWRITE_COLLECTION_LOGO as string,
} as const;
