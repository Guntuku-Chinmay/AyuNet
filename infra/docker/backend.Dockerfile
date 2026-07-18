# Base image
FROM node:24-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

# Copy package descriptors
COPY package.json yarn.lock* ./
COPY packages/ packages/
COPY backend/ backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Generate Prisma Client
RUN yarn workspace backend prisma:generate

# Build NestJS App
RUN yarn workspace backend build

# Runner stage
FROM node:24-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=base /usr/src/app ./

EXPOSE 4000

CMD ["yarn", "workspace", "backend", "start:prod"]
