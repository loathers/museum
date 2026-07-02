# museum

Interactive browser for the display cases of the Kingdom of Loathing. Updated daily! 🏛️

# Contributing

The application uses `yarn` to build a React app and `kysely` to manage a postgres database.

To run locally:

1. Ensure corepack is enabled: `corepack enable`
2. Install the yarn packages: `yarn`
3. Ensure a postgres database is running, e.g. `docker run --name museum --network host -e POSTGRES_PASSWORD=postgres -v "./.docker/data:/var/lib/postgresql/data" --rm postgres:16.14`
4. Copy `.env.template` to `.env` and populate it with your postgres URL
5. Run the kysely migrations: `yarn db:migrate`
6. Start the server: `yarn dev`
