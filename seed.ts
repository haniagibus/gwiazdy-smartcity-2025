import { prisma } from './lib/prisma'

async function main() {
  // await prisma.report.deleteMany();
  // await prisma.opinion.deleteMany();

  const report1 = await prisma.report.create({
    data: {
      id_object: 1,
      name: "Raport testowy 1",
      added_date: new Date(),
    },
  });

  const report2 = await prisma.report.create({
    data: {
      id_object: 2,
      name: "Raport testowy 2",
      added_date: new Date(),
    },
  });

  console.log("Raporty dodane:", report1.id, report2.id);

  const opinion1 = await prisma.opinion.create({
    data: {
      id_object: 1,
      name: "Jan",
      stars: 5,
      added_date: new Date(),
    },
  });

  const opinion2 = await prisma.opinion.create({
    data: {
      id_object: 2,
      name: "Anna",
      stars: 4,
      added_date: new Date(),
    },
  });

  console.log("Opinie dodane:", opinion1.id, opinion2.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
