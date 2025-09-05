import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create a default user
  const user = await prisma.user.create({
    data: {
      email: 'johndoe@example.com',
      name: 'John Doe',
    },
  });
  console.log(`Created user with id: ${user.id}`);

  // Create a sample golf course
  const course = await prisma.golfCourse.create({
    data: {
      name: 'Pebble Beach Golf Links',
      address: '1700 17-Mile Dr',
      municipality: 'Pebble Beach',
      province: 'CA',
      region: 'USA',
      phone: '+1 800-654-9300',
      email: 'info@pebblebeach.com',
      url: 'https://www.pebblebeach.com/',
      latitude: '36.5685',
      longitude: '-121.9506',
    },
  });
  console.log(`Created golf course with id: ${course.id}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
