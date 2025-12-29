/**
 * Prisma Client Instance
 * Singleton pattern to prevent multiple database connections
 */

const { PrismaClient } = require('../../generated/client');

// Create single instance of Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
