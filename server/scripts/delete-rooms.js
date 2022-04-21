require("dotenv").config();
const sdk = require("node-appwrite");

// Init SDK
const client = new sdk.Client();
const database = new sdk.Database(client);

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT,
  APPWRITE_SERVER_API_KEY,
  APPWRITE_COLLECTION_LOGO,
  APPWRITE_COLLECTION_ROOM,
} = process.env;

if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT ||
  !APPWRITE_SERVER_API_KEY ||
  !APPWRITE_COLLECTION_LOGO
)
  throw new Error("Please make sure all appwrite env variables are set");

const Collections = {
  Logo: APPWRITE_COLLECTION_LOGO,
  Room: APPWRITE_COLLECTION_ROOM,
};

if (APPWRITE_ENDPOINT && APPWRITE_PROJECT && APPWRITE_SERVER_API_KEY) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT)
    .setKey(APPWRITE_SERVER_API_KEY);
}

(async function () {
  let count = 0;
  const { documents } = await database.listDocuments(Collections.Room);

  for (const d of documents) {
    try {
      await database.deleteDocument(Collections.Room, d.$id);
      count += 1;
    } catch (e) {
      console.error(e);
    }
  }
  console.log(`Deleted ${count} Rooms`);
})();
