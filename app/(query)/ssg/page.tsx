export default async function Page() {
  console.log("SSG page generate", Date.now());

  const res = await fetch("http://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh");
  const now = await res.json();

  return (
    <div className="p-4">
      <h1>Hello, SSG!</h1>
      <pre className="bg-surface-secondary p-4 rounded-lg w-max">
        <code>{JSON.stringify(now, null, 2)}</code>
      </pre>
    </div>
  );
}
