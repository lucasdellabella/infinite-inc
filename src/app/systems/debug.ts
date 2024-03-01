import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

const debug = (entities: EntitiesPayload, { time }: SystemArgs<any>) => {
  return entities;
};

export default debug;
