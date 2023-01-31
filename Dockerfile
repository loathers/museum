# base node image
FROM node:19-bullseye-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y build-essential openssl python3

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

ADD package.json yarn.lock ./
RUN yarn --production=false

# Setup production node_modules
FROM base as production-deps

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json yarn.lock ./
RUN yarn --production=true

# Build the app
FROM base as build

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

# If we're using Prisma, uncomment to cache the prisma schema
ADD prisma .
RUN npx prisma generate

ADD . .
RUN yarn run build

# Finally, build the production image with minimal footprint
FROM base

ARG DATABASE_URL

ENV NODE_ENV=production

EXPOSE 8080

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules

COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .

RUN npx prisma generate

CMD ["yarn", "run", "start:prod"]
