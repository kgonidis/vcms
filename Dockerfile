# Base image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY public ./public
COPY src ./src
COPY eslint.config.mjs ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]