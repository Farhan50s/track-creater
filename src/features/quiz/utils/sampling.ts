/**
 * Fisher-Yates (Knuth) sampling algorithm.
 * Produces an unbiased, uniform random sample of `count` items from an input pool.
 */
export function sampleQuestions<T>(pool: T[], count: number = 5): T[] {
  if (pool.length <= count) {
    return [...pool];
  }

  const array = [...pool];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array.slice(0, count);
}
