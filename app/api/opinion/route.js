import { prisma } from '../../../lib/prisma'

const form = [
  { id: 1, nazwa: "form" },
];
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (latStr == null || lonStr == null) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }


  const delta = 0.001;

  const opinions = await prisma.opinion.findMany({
    where: {
      x_coord: { gte: lon - delta, lte: lon + delta },
      y_coord: { gte: lat - delta, lte: lat + delta }, 
    },
    orderBy: { added_date: 'desc' },
  });

  return new Response(JSON.stringify(opinions), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { x_coord, y_coord, desc, name, added_date, rating } = body;

    // if (!id_object || !name) {
    //   return new Response(JSON.stringify({ error: 'missing data' }), { status: 400 });
    // }

    const newOpinion = await prisma.opinion.create({
      data: {
        x_coord,
        y_coord,
        desc,
        name,
        added_date,
        rating
      },
    });

    return new Response(JSON.stringify(newOpinion), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to create opinion' }), { status: 500 });
  }
}
