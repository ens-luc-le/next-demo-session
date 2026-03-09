import axios from "axios";

export default async function Page() {
  console.log("SSR page generate", Date.now());

  const now = await axios
    .get(`https://time.now/developer/api/timezone/Asia/Ho_Chi_Minh`)
    .then((res) => res.data)
    .finally(() => console.info("Fetched in SSR page"));

  return (
    <div className="p-4">
      <h1>SSR</h1>
      <pre className="bg-surface-secondary p-4 rounded-lg w-max">
        <code>{JSON.stringify(now, null, 2)}</code>
      </pre>
    </div>
  );
}

export const dynamic = "force-dynamic";
