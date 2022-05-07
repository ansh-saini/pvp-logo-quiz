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
  let data = await database.listDocuments(Collections.Logo, [], 100);

  while (data.total > 0) {
    let { documents, total } = data;

    console.log(`Documents left: ${total}`);
    console.log(`Deleting Batch of: ${documents.length}`);
    for (const d of documents) {
      try {
        await database.deleteDocument(Collections.Logo, d.$id);
        count += 1;
      } catch (e) {
        console.error(e);
      }
    }

    data = await database.listDocuments(Collections.Logo, [], 100);
  }
  console.log(`Deleted ${count} Logos`);
})();
