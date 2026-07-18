# Base image
FROM node:24-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

ARG APP_NAME

# Copy configuration descriptors
COPY package.json yarn.lock* ./
COPY packages/ packages/
COPY apps/${APP_NAME}/ apps/${APP_NAME}/

# Install dependencies
RUN yarn install --frozen-lockfile

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN yarn workspace ${APP_NAME} build

# Runner stage
FROM node:24-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ARG APP_NAME
ENV APP_NAME_ENV=$APP_NAME

COPY --from=base /usr/src/app ./

EXPOSE 3000

# Set default host and port environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "yarn workspace ${APP_NAME_ENV} start"]
