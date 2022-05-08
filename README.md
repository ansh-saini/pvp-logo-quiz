# PVP Logo Quiz

## Project setup guide

1. Install and run Appwrite.
2. Create a project on Appwrite.
3. Head to API Keys section and create a new appwrite server key with the following permissions:
   The command will fail if you have not provided the necessary permissions.

   `users.read, users.write, collections.read, collections.write, attributes.read, attributes.write, indexes.read, indexes.write, documents.read, documents.write`.

   ![Appwrite server API key permissions](https://picsum.photos/200)

4. Clone this repository
5. Create a copy of `.env.example` file. Rename it to `.env` and fill out the variables. You can find values for `APPWRITE_ENDPOINT, APPWRITE_PROJECT` on the Appwrite dashboard itself. `APPWRITE_SERVER_API_KEY` is the server API key secret that we generated.

6. Run `yarn setup` and follow the setup wizard

### What `yarn setup` does?

1. Creates .env file
2. Sets up required databases, index fields, permissions in your appwrite account
