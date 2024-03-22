import axios from "axios";

type Result = { name: string; emoji: string };

const resCache = new Map<string, Result>();

export async function combine(
  name1: string,
  name2: string
): Promise<Result | null> {
  

  const [n1, n2] = [name1, name2].sort()

  const host =
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

  const url = `${host}/api/prompt?name1=${n1}&name2=${n2}`;

  if (!resCache.has(url)) {
    console.log("combining", name1, name2);
    return await axios
      .get(url)
      .then(function (response) {
        // handle success
        console.log(response);
        const res = response?.data;
        const [name, emoji] = res || [];

        const result = {name, emoji}
        if (resCache.size < 100) resCache.set(url, result);
        return result;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        return null;
      });
  } else {
    return resCache.get(url) || null;
  }
}

export default { combine };
