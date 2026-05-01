import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('[Prisma] Initializing adapter with URL:', connectionString.startsWith('libsql') ? 'Turso' : 'Local');

const adapter = new PrismaLibSQL({
  url: connectionString,
  authToken,
});

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
