# Cloud Run container for the Express LLM backend
# Uses Node 20 LTS on Alpine for small image size
FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=8080

# Create app directory
WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code and any content the server needs at runtime
COPY server/ ./server/

# Copy content used for knowledge indexing (new layout)
COPY frontend/src/content/ ./frontend/src/content/

# Cloud Run provides $PORT, our server listens on process.env.PORT
EXPOSE 8080

# Start the Express server
CMD ["node", "server/server.mjs"]
