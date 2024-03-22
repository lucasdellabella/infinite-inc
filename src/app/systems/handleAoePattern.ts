import { partition } from "@/utils/array";
import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

export const handleAoePattern = (
  entities: EntitiesPayload,
  {}: SystemArgs<any>
) => {
  entities.gameObjects?.nodes?.forEach((node) => {
    if (!node.position || !node.aoePattern || !node.isActive) return;
    const targetBox = {
      left: node.position.x - 40,
      right: node.position.x + 140,
      top: node.position.y + 40,
      bottom: node.position.y + 160,
    };

    // Simple AABB (Axis-Aligned Bounding Box) collision detection,
    // assuming entities are rectangles and positions are top-left corners.
    // This may need to be adjusted depending on your coordinate system.
    const [inside, outside] = partition(
      entities.gameObjects?.nodes || [],
      (testNode) => {
        if (testNode.id === node.id || !testNode.position) return false;
        return (
          testNode.position.x >= targetBox.left &&
          testNode.position.x <= targetBox.right &&
          testNode.position.y >= targetBox.top &&
          testNode.position.y <= targetBox.bottom
        );
      }
    );
    if(node.aoePattern?.applyEffect)
      inside.forEach(node.aoePattern.applyEffect);
    if(node.aoePattern?.removeEffect)
        outside.forEach(node.aoePattern.removeEffect);
  });

  return entities;
};
