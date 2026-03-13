async function action(form: FormData) {
  "use server";
  const name = form.get("name");
  console.log("Action executed", { name });
}

export default function Page() {
  return (
    <div className="p-4">
      <h1>Server Action</h1>

      <form action={action} className="flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          autoComplete="off"
          className="border rounded p-2"
        />

        <button type="submit" className="cursor-pointer bg-neutral-300 rounded px-4">
          Submit
        </button>
      </form>
    </div>
  );
}
