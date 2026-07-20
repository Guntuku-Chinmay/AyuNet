# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn workspace backend build

# Stage 2: Production Execution
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
RUN yarn install --frozen-lockfile --production
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

EXPOSE 4000
CMD ["node", "backend/dist/src/main.js"]
