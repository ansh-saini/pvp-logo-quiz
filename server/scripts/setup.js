/**
 * USER:
 * Create .env file with three variables.
 * run yarn setup
 */

require("dotenv").config();
const sdk = require("node-appwrite");

console.log("Running setup script\n");

const {
  SCRIPT_TEST_APPWRITE_SERVER_API_KEY: APPWRITE_SERVER_API_KEY,
  SCRIPT_TEST_APPWRITE_ENDPOINT: APPWRITE_ENDPOINT,
  SCRIPT_TEST_APPWRITE_PROJECT: APPWRITE_PROJECT,
} = process.env;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT || !APPWRITE_SERVER_API_KEY)
  throw new Error(`Please make sure the following env variables are set:${
    !APPWRITE_ENDPOINT ? "\nAPPWRITE_ENDPOINT" : ""
  }${!APPWRITE_PROJECT ? "\nAPPWRITE_PROJECT" : ""}${
    !APPWRITE_SERVER_API_KEY ? "\nAPPWRITE_SERVER_API_KEY" : ""
  }
`);

// Init SDK
const client = new sdk.Client();
const database = new sdk.Database(client);

if (APPWRITE_ENDPOINT && APPWRITE_PROJECT && APPWRITE_SERVER_API_KEY) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT)
    .setKey(APPWRITE_SERVER_API_KEY);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isAttributeAvailable = async (collectionId, key) => {
  let available =
    (await database.getAttribute(collectionId, key)).status === "available";

  let tries = 1;
  // If it fails after trying 5 times, we return false
  while (!available && tries < 5) {
    await sleep(1000);
    available =
      (await database.getAttribute(collectionId, key)).status === "available";
    tries++;
  }

  return available;
};

const initDatabase = async () => {
  const { collections } = await database.listCollections();

  const createLogoCollection = async () => {
    const COLLECTION_NAME = "Logo";
    const exisingCollection = collections.find(
      ({ name }) => name === COLLECTION_NAME
    );
    if (exisingCollection) {
      // throw new Error(
      //   `${COLLECTION_NAME} collection already exists. Please delete it from the Appwrite dashboard before proceeding.`
      // );

      console.log(`Deleting existing collection: ${COLLECTION_NAME}`);
      await database.deleteCollection(exisingCollection.$id);
    }

    console.log(`Creating new collection: ${COLLECTION_NAME}`);
    const { $id } = await database.createCollection(
      "unique()",
      COLLECTION_NAME,
      "document",
      ["role:all"],
      []
    );

    console.log("\nCreating new attribute: name");
    await database.createStringAttribute($id, "name", 1000, true);
    console.log("Creating new attribute: image");
    await database.createUrlAttribute($id, "image", true);
    console.log("Creating new attribute: difficulty");
    await database.createIntegerAttribute($id, "difficulty", false);
    console.log("Creating new attribute: category");
    await database.createStringAttribute($id, "category", 255, false);

    console.log("\nCreating unique index on name\n");
    // Wait for attribute to be available
    if (await isAttributeAvailable($id, "name"))
      database.createIndex($id, "name", "unique", ["name"], ["ASC"]);

    return $id;
  };

  const createRoomCollection = async () => {
    const COLLECTION_NAME = "Room";
    const exisingCollection = collections.find(
      ({ name }) => name === COLLECTION_NAME
    );
    if (exisingCollection) {
      // throw new Error(
      //   `${COLLECTION_NAME} collection already exists. Please delete it from the Appwrite dashboard before proceeding.`
      // );

      console.log(`Deleting existing collection: ${COLLECTION_NAME}`);
      await database.deleteCollection(exisingCollection.$id);
    }

    console.log(`Creating new collection: ${COLLECTION_NAME}`);
    const { $id } = await database.createCollection(
      "unique()",
      COLLECTION_NAME,
      "collection",
      [],
      []
    );

    console.log("\nCreating string attribute: code");
    await database.createStringAttribute($id, "code", 255, true);
    console.log("Creating string attribute: owner");
    await database.createStringAttribute($id, "owner", 255, true);
    console.log("Creating enum attribute: status");
    await database.createEnumAttribute(
      $id,
      "status",
      ["started", "lobby", "completed"],
      true
    );
    console.log("Creating integer attribute: startTime");
    await database.createIntegerAttribute($id, "startTime", false);
    console.log("Creating string attribute: gameState");
    await database.createStringAttribute($id, "gameState", 10000, false);
    console.log("Creating string[] attribute: players");
    await database.createStringAttribute(
      $id,
      "players",
      500,
      true,
      undefined,
      true
    );
    console.log("Creating string attribute: p1");
    await database.createStringAttribute($id, "p1", 2000, false);
    console.log("Creating string attribute: p2");
    await database.createStringAttribute($id, "p2", 2000, false);

    console.log("\nCreating unique index on code\n");
    // Wait for attribute to be available
    if (await isAttributeAvailable($id, "code"))
      database.createIndex($id, "code", "unique", ["code"], ["ASC"]);

    return $id;
  };

  const logoCollectionId = await createLogoCollection();
  const roomCollectionId = await createRoomCollection();

  console.log("Database setup complete");
  console.log(
    `\n**CREATED 2 COLLECTIONS. ADD THE FOLLOWING LINES IN YOUR .env FILE:**\nAPPWRITE_COLLECTION_LOGO=${logoCollectionId}\nAPPWRITE_COLLECTION_ROOM=${roomCollectionId}`
  );

  return {
    logoCollectionId,
    roomCollectionId,
  };
};

const hydrateDatabase = async () => {};

(async () => {
  await initDatabase();
  await hydrateDatabase();

  console.log("\n\nSETUP COMPLETE");
})();
