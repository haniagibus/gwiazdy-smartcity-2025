import { prisma } from './lib/prisma'

async function main() {
  const report = await prisma.report.create({
    data: {
      name: 'Alice',
        id_object: 3,
      added_date:new Date('2025-07-08'),
    },

  })
  console.log('Created report:', report)

  const allReports = await prisma.report.findMany({

  })
  console.log('All reports:', JSON.stringify(allReports, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })