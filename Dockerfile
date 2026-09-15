# Production Dockerfile for MediRoute on Koyeb / Render / Cloud
FROM node:20-alpine

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install root dependencies
RUN npm install

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Return to root and copy all source code
WORKDIR /app
COPY . .

# Build frontend production bundle
RUN node ./node_modules/typescript/bin/tsc -b && node ./node_modules/vite/bin/vite.js build

# Generate Prisma Client and initialize SQLite DB
WORKDIR /app/backend
RUN npx prisma generate
RUN npx prisma db push

EXPOSE 8000 5000
ENV PORT=8000
ENV NODE_ENV=production

CMD ["npx", "tsx", "src/server.ts"]
