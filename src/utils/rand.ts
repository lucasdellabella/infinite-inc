/**
* Returns a random integer between min (inclusive) and max (inclusive).
*/
export const randInt = (min: number, max: number) => {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}