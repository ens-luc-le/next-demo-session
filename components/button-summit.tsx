"use client";

import { useFormStatus } from "react-dom";

export function ButtonSummit() {
  const form = useFormStatus();

  console.log("form", form);

  return (
    <button type="submit" className="cursor-pointer bg-neutral-300 rounded px-4">
      {form.pending ? "Submitting..." : "Submit"}
    </button>
  );
}
