import { Client, Database } from "node-appwrite";

// Init SDK
export const client = new Client();
export const database = new Database(client);

const init = () => {
  const { APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_SERVER_API_KEY } =
    process.env;

  if (APPWRITE_ENDPOINT && APPWRITE_PROJECT && APPWRITE_SERVER_API_KEY) {
    client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT)
      .setKey(APPWRITE_SERVER_API_KEY);
  }
};

init();
