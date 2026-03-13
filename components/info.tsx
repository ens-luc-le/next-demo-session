import { getGreeting } from "$/utils/db";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function Info() {
  "use cache";
  cacheTag("greeting");
  const { name } = await getGreeting();

  return <div className="p-4 rounded-lg bg-rose-200">Hello, {name}!</div>;
}
