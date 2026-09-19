import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const rest = await prisma.restaurant.findUnique({ where: { email: 'geller.9797@mail.ru' } });
  console.log(rest);
}

main().then(() => process.exit(0)).catch(console.error);
