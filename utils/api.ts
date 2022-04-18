import { appwrite } from "global/appwrite";
import { AppwriteException, Query } from "appwrite";

export async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

export const API = {
  account: {
    async get() {
      try {
        const data = await appwrite.account.get();
        return successResponse(data);
      } catch (e: any) {
        return errorResponse(e);
      }
    },
    async deleteSession(sessionId: string) {
      try {
        const data = await appwrite.account.deleteSession(sessionId);
        return successResponse(data);
      } catch (e: any) {
        return errorResponse(e);
      }
    },
  },
} as const;

const successResponse = <T>(data: T): { isOK: true; data: T } => {
  return {
    isOK: true,
    data,
  };
};

const errorResponse = (
  e: any
): {
  isOK: false;
} & (
  | { isAppwriteException: false; error: any }
  | { isAppwriteException: true; error: AppwriteException }
) => {
  if (e.response?.type) {
    // We can be sure that this is an Appwrite error
    return {
      isOK: false,
      isAppwriteException: true,
      error: e as AppwriteException,
    };
  }
  console.error("Looks like a JavaScript error occured", e);
  return {
    isOK: false,
    isAppwriteException: false,
    error: e as any,
  };
};
