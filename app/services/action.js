"use server";

export const saveOpinionToDatabase = async (formData) => {
  const nick = formData.get("nick");
  const desc = formData.get("desc");
  const rating = Number(formData.get("rating"));

  const res = await fetch("http://localhost:3000/api/opinion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_object: 1,
      name: nick,
      desc: desc,
      rating: rating,
      added_date: new Date().toISOString()
    }),
  });

  if (!res.ok) throw new Error("Failed to save opinion");

  const result = await res.json();
  return result;
};

export const getOpinionsFromDatabase = async () => {
  const res = await fetch("http://localhost:3000/api/opinion", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch opinions");

  return await res.json();
};

export const saveReportToDatabase = async (formData) => {
  const nick = formData.get("nick");
  const desc = formData.get("desc");
  const x = formData.get('x_coord');
  const y = formData.get('y_coord');

  const res = await fetch("http://localhost:3000/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      x_coord: Number(x),
      y_coord: Number(y),
      name: nick,
      desc: desc,
      added_date: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
  const errorText = await res.text();
  console.error("API ERROR RESPONSE:", errorText);
  throw new Error("Failed to save report");
}

  const result = await res.json();
  return result;
};

export const getReportsFromDatabase = async () => {
  const res = await fetch("http://localhost:3000/api/report", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch opinions");

  return await res.json();
};