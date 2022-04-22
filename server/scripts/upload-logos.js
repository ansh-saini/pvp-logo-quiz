// @ts-nocheck
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const sdk = require("node-appwrite");

// Init SDK
const client = new sdk.Client();
const database = new sdk.Database(client);

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT,
  APPWRITE_SERVER_API_KEY,
  APPWRITE_COLLECTION_LOGO,
} = process.env;

if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT ||
  !APPWRITE_SERVER_API_KEY ||
  !APPWRITE_COLLECTION_LOGO
)
  throw new Error("Please make sure all appwrite env variables are set");

const IMG_PREFIX = "http://localhost:3000/assets/logos/";
const Collections = {
  Logo: APPWRITE_COLLECTION_LOGO,
};

if (APPWRITE_ENDPOINT && APPWRITE_PROJECT && APPWRITE_SERVER_API_KEY) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT)
    .setKey(APPWRITE_SERVER_API_KEY)
    .setSelfSigned(); // Use only on dev mode with a self-signed SSL cert
}

const getLogoFiles = () => {
  const directoryPath = path.join(__dirname, "../../public/assets/logos");
  return fs.readdirSync(directoryPath, function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    return files;
  });
};

const shouldCreate = (logo) => {
  return new Promise(async (resolve) => {
    try {
      const response = await database.listDocuments(Collections.Logo, [
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

(async function () {
  let count = 0;
  try {
    const logoFiles = getLogoFiles();

    for (const fileName of logoFiles) {
      const logo = fileName.split(".")[0];

      if (await shouldCreate(logo)) {
        try {
          await database.createDocument(Collections.Logo, "unique()", {
            name: logo,
            image: encodeURI(IMG_PREFIX + fileName),
            difficulty: 0,
            Category: "Automobile",
          });
          console.log(`Created ${logo}`);
          count += 1;
        } catch (e) {
          console.error(`Failed to create ${logo}`, e);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  console.log(`Created ${count} logos`);
})();
