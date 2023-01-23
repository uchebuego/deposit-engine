export function sleep(delay: number = 100) {
  return new Promise((res) => setTimeout(res, delay));
}
