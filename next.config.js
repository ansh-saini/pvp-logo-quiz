/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
    APPWRITE_PROJECT: process.env.APPWRITE_PROJECT,
    APPWRITE_SERVER_API_KEY: process.env.APPWRITE_SERVER_API_KEY,

    // Collections
    APPWRITE_COLLECTION_ROOM: process.env.APPWRITE_COLLECTION_ROOM,
    APPWRITE_COLLECTION_LOGO: process.env.APPWRITE_COLLECTION_LOGO,
  },
};

module.exports = nextConfig;
