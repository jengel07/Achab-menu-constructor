process.env.DATABASE_URL = 'postgresql://postgres:postgres@db:5432/mydb?schema=public';
const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function fixTrials() {
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'TRIAL', trialEndsAt: null }
  });
  
  for (const r of restaurants) {
    const trialEnds = new Date(r.createdAt);
    trialEnds.setDate(trialEnds.getDate() + 14);
    
    await prisma.restaurant.update({
      where: { id: r.id },
      data: { trialEndsAt: trialEnds }
    });
  }
  console.log(`Fixed ${restaurants.length} restaurants missing trialEndsAt`);
}

fixTrials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

