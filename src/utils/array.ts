export function partition<T>(array: T[], isValid: (n: T) => boolean) {
  return array.reduce(
    ([pass, fail], elem: T) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[] as T[], [] as T[]]
  );
}
