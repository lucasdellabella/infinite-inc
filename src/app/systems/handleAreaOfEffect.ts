import { partition } from "@/utils/array";
import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

export const handleAreaOfEffect = (
  entities: EntitiesPayload,
  {}: SystemArgs<any>
) => {
  entities.gameObjects?.nodes?.forEach((node) => {
    if (!node.position || !node.areaOfEffect || !node.isActive) return;
    const { shape, dims, offset, applyEffect, removeEffect } =
      node.areaOfEffect;

    const bboxCenter = {
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
    };

    const [inside, outside] = partition(
      entities.gameObjects?.nodes || [],
      (testNode) => {
        if (testNode.id === node.id || !testNode.position) return false;

        if (shape === "rectangle") {
          const targetBox = {
            left: bboxCenter.x - dims.x / 2,
            right: bboxCenter.x + dims.x / 2,
            top: bboxCenter.y - dims.y / 2,
            bottom: bboxCenter.y + dims.y / 2,
          };

          return (
            testNode.position.x >= targetBox.left &&
            testNode.position.x <= targetBox.right &&
            testNode.position.y >= targetBox.top &&
            testNode.position.y <= targetBox.bottom
          );
        } else if (shape === "ellipse") {
          const dx = testNode.position.x - bboxCenter.x;
          const dy = testNode.position.y - bboxCenter.y;
          const radiusX = dims.x / 2;
          const radiusY = dims.y / 2;
          return (
            (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <=
            1
          );
        }
        return false;
      }
    );

    inside?.forEach((node) => {
      applyEffect(node);
    });
    outside?.forEach((node) => {
      removeEffect(node);
    });
  });

  return entities;
};
