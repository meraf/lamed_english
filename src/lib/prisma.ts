import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

// THIS LINE IS CRITICAL: 
// It prevents the creation of multiple Prisma instances in development mode.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma