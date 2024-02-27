import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

export const moveNodes = (
  entities: EntitiesPayload,
  { input, time }: SystemArgs<any>
) => {
  entities.gameObjects.nodes.forEach((node) => {
    // Operate on only applicable nodes
    if (node.draggable && node.position)
      if (!node.draggable.isBeingDragged) {
        node.position.x += time.delta / 2 / 10;
      }
  });

  return entities;
};
