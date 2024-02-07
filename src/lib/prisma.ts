// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma: PrismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL,
    },
  },
})

export default prisma
