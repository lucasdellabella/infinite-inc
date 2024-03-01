import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

const BOUNDS_PADDING = 10;

const handleOutOfBounds = (
  entities: EntitiesPayload,
  { window }: SystemArgs<any>
) => {
  const nodes = entities.gameObjects.nodes;
  
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (node.position) {
      if (node.position.x < BOUNDS_PADDING || node.position.x >= window.innerWidth - BOUNDS_PADDING) {
        nodes.splice(i, 1)
      } else if (node.position.y < BOUNDS_PADDING || node.position.y >= window.innerHeight - BOUNDS_PADDING) {
        nodes.splice(i, 1)
      }
    }
  }

  return entities;
};

export default handleOutOfBounds;
