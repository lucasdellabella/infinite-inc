import seedrandom from 'seedrandom';

// Function to get a seeded random number generator
const getSeededRandom = (seed: string) => seedrandom(seed);

export function partition<T>(array: T[], isValid: (n: T) => boolean) {
  return array.reduce(
    ([pass, fail], elem: T) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[] as T[], [] as T[]]
  );
}

export function selectRandomElement<T> (array:T[], seed: string)  {
  // If the array is empty, return undefined
  if (array.length === 0) {
    return undefined;
  }
  
  // Create a seeded random number generator
  const rng = getSeededRandom(seed);
  
  // Generate a random index based on the array's length
  const randomIndex = Math.floor(rng() * array.length);
  
  // Return the randomly selected element
  return array[randomIndex];
}