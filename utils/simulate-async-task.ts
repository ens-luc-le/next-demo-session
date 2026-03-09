import { random } from "lodash-es";

export async function simulateAsyncTask<T>(
  options: { min?: number; max?: number; response?: T } = {},
) {
  const { min = 1000, max = 3000 } = options;
  const delay = random(min, max);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.info("Simulated async task completed after", delay, "ms");
      resolve(options.response);
    }, delay);
  });
}
