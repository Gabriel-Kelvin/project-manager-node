FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port 8010
EXPOSE 8010

# Start the server
CMD ["node", "--env-file=.env", "src/server.js"]

