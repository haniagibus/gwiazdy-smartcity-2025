import { prisma } from '../../../lib/prisma'

const form = [
  { id: 1, nazwa: "form" },
];

export async function GET(req) {
  const reports = await prisma.opinion.findMany();
  return new Response(JSON.stringify(reports), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { id_object, name, desc, rating, added_date } = body;

    if (!id_object || !name) {
      return new Response(JSON.stringify({ error: 'missing data' }), { status: 400 });
    }

    const newReport = await prisma.report.create({
      data: {
        id_object,
        name,
        desc,
        rating,
        added_date,
      },
    });

    return new Response(JSON.stringify(newReport), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to create report' }), { status: 500 });
  }
}
