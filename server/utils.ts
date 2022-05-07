import { IncomingHttpHeaders } from "http";
import { Account, Client } from "node-appwrite";

export const getCurrentUser = async (headers: IncomingHttpHeaders) => {
  const { jwt } = headers;

  if (!jwt || Array.isArray(jwt)) {
    return {
      user: null,
      error: {
        authNotProvided: true,
        message: "Authentication was not provided",
      },
    };
  }

  const { APPWRITE_ENDPOINT, APPWRITE_PROJECT } = process.env;

  const client = new Client();

  const account = new Account(client);

  client
    .setEndpoint(APPWRITE_ENDPOINT || "")
    .setProject(APPWRITE_PROJECT || "")
    .setJWT(jwt);

  try {
    const user = await account.get();
    return {
      user,
    };
  } catch (e) {
    return {
      user: null,
      error: { authExpired: true, message: "Authentication expired" },
    };
  }
};
