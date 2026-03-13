import { ButtonSummit } from "$/components/button-summit";
import { getGreeting, updateGreeting } from "$/utils/db";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

async function action(form: FormData) {
  "use server";
  const name = form.get("name") as string;

  await updateGreeting(name);

  revalidateTag("greeting");

  // revalidatePath("/server-action");
  // redirect("/server-action");
}

export async function Form() {
  const { name } = await getGreeting();

  return (
    <form action={action} className="flex gap-2">
      <input
        type="text"
        name="name"
        placeholder="Enter your name"
        autoComplete="off"
        className="border rounded p-2"
        defaultValue={name}
      />

      <ButtonSummit />
      {/*
      <button type="submit" className="cursor-pointer bg-neutral-300 rounded px-4">
        Submit
      </button> */}
    </form>
  );
}
