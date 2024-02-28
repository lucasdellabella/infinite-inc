import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

export const handleEmits = (entities: EntitiesPayload, {}: SystemArgs<any>) => {
  //   entities.gameObjects.nodes.forEach((node) => {
  //     if (node.emits) {
  //     }
  //   });

  return entities;
};
