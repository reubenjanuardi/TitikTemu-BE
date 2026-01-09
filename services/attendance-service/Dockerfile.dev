# Attendance Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dumb-init and OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl

# Copy package files
COPY package*.json ./

# Install dependencies (try npm ci first, fallback to npm install)
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Copy application code
COPY . .

# Generate Prisma client for Linux
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/index.js"]
