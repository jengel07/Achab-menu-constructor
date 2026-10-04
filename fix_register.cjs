import fs from 'fs';

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

const regex = /const newRestaurant = await db\.restaurant\.create\(\{\s*data: \{\s*email,\s*password: hashedPassword,\s*name: name \|\| email\.split\('@'\)\[0\],\s*menus: \{ create: \{\} \},\s*\},\s*\}\);/;

const replacement = `const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3 days default trial
      const newRestaurant = await db.restaurant.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          status: 'TRIAL',
          paymentStatus: 'trial',
          trialEndsAt: trialEndsAt,
          menus: { create: {} },
        },
      });`;

if (code.includes('password: hashedPassword')) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('daur-menu-backend/index.js', code);
    console.log('Fixed register logic');
} else {
    console.log('Could not find register logic');
}

