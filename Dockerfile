# Production Multi-Stage Dockerfile for MediRoute
FROM node:20-alpine AS builder

WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm install

# Copy source and build frontend
COPY . .
RUN node ./node_modules/typescript/bin/tsc -b && node ./node_modules/vite/bin/vite.js build

# Install backend dependencies & generate Prisma client
WORKDIR /app/backend
RUN npm install
RUN npx prisma generate
RUN npx prisma db push

EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

CMD ["npx", "tsx", "src/server.ts"]
