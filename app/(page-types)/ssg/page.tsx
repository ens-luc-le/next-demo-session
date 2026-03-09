import axios from "axios";

export default async function Page() {
  console.log("SSG page generate", Date.now());

  const now = await axios
    .get(`https://time.now/developer/api/timezone/Asia/Ho_Chi_Minh`)
    .then((res) => res.data)
    .finally(() => console.info("Fetched in SSG page"));

  return (
    <div className="p-4">
      <h1>SSG</h1>
      <pre className="bg-surface-secondary p-4 rounded-lg w-max">
        <code>{JSON.stringify(now, null, 2)}</code>
      </pre>
    </div>
  );
}
