import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

export const handleDisappears = (
    entities: EntitiesPayload,
    { time }: SystemArgs<any>
  ) => {
    const nodes = entities.gameObjects?.nodes || [];
    
    for (let i = nodes.length - 1; i >= 0; i--) {
      const { disappears } = nodes[i];
      if (disappears) {
        disappears.timeLeft -= time.delta;
        if (disappears.timeLeft <= 0) {
          nodes.splice(i, 1); // Remove the node at index i
        }
      }
    }
    
    return entities;
  };
  