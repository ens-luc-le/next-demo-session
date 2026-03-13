import { Form } from "$/components/form";
import { Info } from "$/components/info";

export default async function Page() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1>Server Action</h1>

      <Form />
      <Info />
    </div>
  );
}
