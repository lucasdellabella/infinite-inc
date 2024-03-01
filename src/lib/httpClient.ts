import axios from "axios";
import { capitalizeFirstLetter } from "../utils/string";

export async function combine(
  name1: string,
  name2: string
): Promise<{ name: string; emoji: string } | null> {
  console.log("combining", name1, name2);

  const host =
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

  const url = `${host}/api/prompt?name1=${name1}&name2=${name2}`;
  return await axios
    .get(url)
    .then(function (response) {
      // handle success
      console.log(response);
      const res = response?.data;
      const [name, emoji] = res || [];

      return {
        name: name
          .replaceAll("_", " ")
          .split(" ")
          .map(capitalizeFirstLetter)
          .join(" "),
        emoji,
      };
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      return null;
    });
}

export default { combine };
