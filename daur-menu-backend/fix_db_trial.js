import db from './db.js';

async function fixTrials() {
  const restaurants = await db.restaurant.findMany({
    where: { status: 'TRIAL', trialEndsAt: null }
  });
  
  for (const r of restaurants) {
    const trialEnds = new Date(r.createdAt);
    trialEnds.setDate(trialEnds.getDate() + 14);
    
    await db.restaurant.update({
      where: { id: r.id },
      data: { trialEndsAt: trialEnds }
    });
  }
  console.log(`Fixed ${restaurants.length} restaurants missing trialEndsAt`);
}

fixTrials()
  .catch(console.error)
  .finally(() => process.exit(0));

