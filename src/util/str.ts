export function capitalizeWords(s: string) {
  return s
    .split(" ")
    .map((x) => x[0].toLocaleUpperCase() + x.substring(1))
    .join(" ")
}
