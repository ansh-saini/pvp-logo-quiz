const path = require("path");
const fs = require("fs");
const sdk = require("node-appwrite");
require("dotenv").config();

console.log("Running setup script\n");

const {
  APPWRITE_SERVER_API_KEY: APPWRITE_SERVER_API_KEY,
  APPWRITE_ENDPOINT: APPWRITE_ENDPOINT,
  APPWRITE_PROJECT: APPWRITE_PROJECT,
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
      throw new Error(
        `${COLLECTION_NAME} collection already exists. Please delete it from the Appwrite dashboard before proceeding.`
      );

      // Use this while testing
      // console.log(`Deleting existing collection: ${COLLECTION_NAME}`);
      // await database.deleteCollection(exisingCollection.$id);
    }

    console.log(`Creating new collection: ${COLLECTION_NAME}`);
    const { $id } = await database.createCollection(
      "unique()",
      COLLECTION_NAME,
      "collection",
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
      throw new Error(
        `${COLLECTION_NAME} collection already exists. Please delete it from the Appwrite dashboard before proceeding.`
      );

      // Use this while testing
      // console.log(`Deleting existing collection: ${COLLECTION_NAME}`);
      // await database.deleteCollection(exisingCollection.$id);
    }

    console.log(`Creating new collection: ${COLLECTION_NAME}`);
    const { $id } = await database.createCollection(
      "unique()",
      COLLECTION_NAME,
      "document",
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

  console.log("DATABASE SETUP COMPLETE");

  return {
    logoCollectionId,
    roomCollectionId,
  };
};

const hydrateDatabase = async (logoCollectionId) => {
  const getLogoFiles = () => {
    // Path of logos folder
    const logoDirectory = path.join(__dirname, "../../public/assets/logos");

    return fs.readdirSync(logoDirectory, function (err, files) {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }
      return files;
    });
  };
  const shouldCreate = (logo) => {
    return new Promise(async (resolve) => {
      try {
        const response = await database.listDocuments(logoCollectionId, [
          sdk.Query.equal("name", logo),
        ]);
        if (response.total === 0) {
          resolve(true);
        }
        resolve(false);
      } catch (e) {
        console.error(e);
        resolve(false);
      }
    });
  };

  const IMG_PREFIX = "http://localhost:3000/assets/logos/";

  let count = 0;
  try {
    const logoFiles = getLogoFiles();

    for (const fileName of logoFiles) {
      const chunks = fileName.split(".");
      // File extension
      chunks.pop();
      const logo = chunks.join(".");
      const [name, category] = logo.split("__");

      if (await shouldCreate(logo)) {
        try {
          await database.createDocument(logoCollectionId, "unique()", {
            name: name,
            image: encodeURI(IMG_PREFIX + fileName),
            difficulty: 0,
            category: category,
          });
          if (category) console.log(`Created ${name} (${category})`);
          else console.log(`Created ${name}`);
          count += 1;
        } catch (e) {
          console.error(`Failed to create ${name}`, e);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  console.log(`\n\nHYDRATION COMPLETE: Created ${count} documents`);
};

(async () => {
  const { logoCollectionId, roomCollectionId } = await initDatabase();
  await hydrateDatabase(logoCollectionId);

  console.log("\n\nSETUP COMPLETE");
  console.log(
    `\n**CREATED 2 COLLECTIONS. ADD THE FOLLOWING LINES IN YOUR .env FILE:**\nAPPWRITE_COLLECTION_LOGO=${logoCollectionId}\nAPPWRITE_COLLECTION_ROOM=${roomCollectionId}`
  );
})();
