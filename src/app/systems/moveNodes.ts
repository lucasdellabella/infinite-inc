import { EntitiesPayload } from "../engine-only/page";
import { SystemArgs } from "./utils";

export const moveNodes = (
  entities: EntitiesPayload,
  { input, time }: SystemArgs<any>
) => {
  entities.gameObjects.nodes.forEach((node) => {
    if (!node.isBeingDragged) {
      node.x += time.delta / 2 / 10;
    }
  });

  return entities;
};
