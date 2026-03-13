import { simulateHeavySyncTask } from "$/utils/simulate-heavy-sync-task";

export default function Loading() {
  simulateHeavySyncTask();

  return <div>Loading page types ...</div>;
}
