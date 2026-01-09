# Venue Consumer Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dumb-init and OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl

# Copy package files
COPY package*.json ./

# Install all dependencies and add missing packages
RUN npm ci 2>/dev/null || npm install && npm install axios

# Copy application code
COPY . .

# Generate Prisma client if schema exists
RUN if [ -f prisma/schema.prisma ] || [ -f schema.prisma ]; then npx prisma generate; fi

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/index.js"]
