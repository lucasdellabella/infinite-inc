import axios from "axios";

type Result = { name: string; emoji: string; props: any[] };

const resCache = new Map<string, Promise<Result | null>>();

export async function combine(name1: string, name2: string) {
  try {
    const [n1, n2] = [name1, name2].sort();

    const host =
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

    const url = `${host}/api/prompt?name1=${n1}&name2=${n2}`;

    if (!resCache.has(url)) {
      console.log("combining", name1, name2);
      const p = axios
        .get(url)
        .then(function (response) {
          // handle success
          console.log(response);
          const res = response?.data;
          const [name, emoji, props] = res || [];

          const result = { name, emoji, props };
          return result;
        })
        .catch(function (error) {
          // handle error
          console.log(error);
          return null;
        });
      if (resCache.size < 100) resCache.set(url, p);
      return p;
    } else {
      return JSON.parse(JSON.stringify(resCache.get(url) || null));
    }
  } catch (e) {
    console.log("too slow!", name1, name2);
    return null;
  }
}

export default { combine };
