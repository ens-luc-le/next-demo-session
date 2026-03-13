import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4">
      <h1>Hello, Next.js!</h1>

      <Link href="/ssr">SSR</Link>
      <br />
      <Link href="/ssg">SSG</Link>
      <br />
      <Link href="/isr">ISR</Link>
    </div>
  );
}
