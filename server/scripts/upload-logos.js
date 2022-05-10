const CryptoJS = require("crypto-js");

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

// You can update this to your cdn path if you want to host logos else where
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

const hashFileName = (fileName) => {
  const chunks = fileName.split(".");
  const ext = chunks.pop();
  const logo = chunks.join(".");

  const hash = CryptoJS.SHA1(logo).toString();

  return `${hash}.${ext}`;
};

(async function () {
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
          await database.createDocument(Collections.Logo, "unique()", {
            name: name,
            // Hash file name to prevent answer leak
            image: encodeURI(IMG_PREFIX + hashFileName(fileName)),
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
  console.log(`Created ${count} logos`);
})();

// Helper function which creates a copy of the logos folder with hashed filenames (Upload the generated folder to cdn)
const generateHashedLogos = () => {
  const logoDirectory = path.join(__dirname, "../../public/assets/logos");

  let count = 0;
  try {
    const logoFiles = getLogoFiles();

    for (const fileName of logoFiles) {
      fs.copyFile(
        path.join(logoDirectory, fileName),
        path.join(
          logoDirectory.replace("logos", "pvp-logo-quiz"),
          hashFileName(fileName)
        ),
        (err) => {
          console.log(`Error copying: ${fileName}`);
          if (err) throw err;
        }
      );
      count++;
    }
  } catch (e) {
    console.error(e);
  }
  console.log(`Hashed ${count} logos`);
};

// generateHashedLogos();
