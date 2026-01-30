FROM node:20-alpine

WORKDIR /app

# Install OS deps needed by Prisma and Node
RUN apk add --no-cache \
	ca-certificates \
	openssl \
	git

# Copy package files early for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy the rest of the application
COPY . .

# Make entrypoint executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Run the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
