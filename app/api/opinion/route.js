const form = [
  { id: 1, nazwa: "form" },
];

export async function GET(req) {
  return new Response(JSON.stringify(form), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
