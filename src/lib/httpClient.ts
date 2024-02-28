import axios from "axios";

export async function combine(
  name1: string,
  name2: string
): Promise<string | null> {
  return await axios
    .get(`/api/prompt?name1=${name1}&name2=${name2}`)
    .then(function (response) {
      // handle success
      console.log(response);
      const res = response.data;
      return res as string;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      return null;
    });
}


export default { combine };
