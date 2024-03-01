import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

const handleVelocity = (
  entities: EntitiesPayload,
  { time }: SystemArgs<any>
) => {
  entities.gameObjects.nodes.forEach((node) => {
    if (!node.isActive) return;
    // Operate on only applicable nodes
    if (node.velocity && node.position) {
      if (node.draggable && node.draggable.isBeingDragged) {
        return;
      }

      node.position.x += (node.velocity.vx * time.delta) / 1000;
      node.position.y += (node.velocity.vy * time.delta) / 1000;
    }
  });

  return entities;
};

export default handleVelocity;
