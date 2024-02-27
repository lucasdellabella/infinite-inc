// https://vercel.com/docs/functions/quickstart#create-an-api-route

// invoke this endpoint locally from localhost:3000/api/hello
// run a vercel dev server via `npx vercel dev`
// believe you can run the vite server and vercel server at the same time.
export function GET(request: Request) {
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}
