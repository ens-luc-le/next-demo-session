export function simulateHeavySyncTask() {
  const startTime = performance.now() + 1000;
  while (performance.now() < startTime) {}
}
