import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

const handleMovementPattern = (
  entities: EntitiesPayload,
  { time }: SystemArgs<any>
) => {
  entities.gameObjects.nodes.forEach((node) => {
    if (!node.isActive) return
    // Operate on only applicable nodes
    if (node.movementPattern && !node.draggable?.isBeingDragged) {
      node.movementPattern.update(time, node);
    }
  });

  return entities;
};

export default handleMovementPattern;
