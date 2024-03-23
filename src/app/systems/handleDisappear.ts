import { safeDelete } from "@/utils/entities";
import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

export const handleDisappears = (
  entities: EntitiesPayload,
  { time }: SystemArgs<any>
) => {
  const nodes = entities.gameObjects?.nodes || [];
  const { counts } = entities || {};

  for (let i = nodes.length - 1; i >= 0; i--) {
    const { disappears, isActive } = nodes[i];
    if (disappears && isActive) {
      disappears.timeLeftMs -= time.delta;
      if (disappears.timeLeftMs <= 0) {
        safeDelete(nodes, counts, i);
      }
    }
  }

  return entities;
};
