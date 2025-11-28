"use server";
import { prisma } from '../../lib/prisma'

export const saveFormDatasToDatabase = async (formData) => {
  const nick = formData.get("nick");
  const desc = formData.get("desc");
  const rating = formData.get("rating");

  console.log("NICK:", nick);
  console.log("DESC:", desc);
  console.log("RATING:", rating);

    const report = await prisma.opinion.create({
      data: {
        id_object: 1,
        name: nick,
        rating: Number(rating),
        added_date: new Date(),
        desc: desc,
      },
    });

};
