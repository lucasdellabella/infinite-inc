import { dropEntityById, safePush } from "@/utils/entities";
import { combine } from "../../lib/httpClient";
import { EntitiesPayload } from "../App";
import { createDefaultGameObject } from "../gameObjectConstructors";
import { Input, SystemArgs } from "./utils";

function extractPageCoordinates(event: Input): {
  pageX: number;
  pageY: number;
} {
  let pageX = 0,
    pageY = 0;

  // Check for mouse events
  if ("pageX" in event && "pageY" in event) {
    pageX = event.pageX;
    pageY = event.pageY;
  }
  // Check for touch events, using the first touch point
  else if ("touches" in event && event.touches.length > 0) {
    pageX = event.touches[0].pageX;
    pageY = event.touches[0].pageY;
  } else {
    throw new Error(`did not match valid event types`);
  }

  return { pageX, pageY };
}

export const handleDrag = (() => {
  let dragEntityId = "";
  const resetDragState = () => {
    dragEntityId = "";
  };

  const checkForEntityDrop = (
    entities: EntitiesPayload,
    draggedEntityIndex: number
  ) => {
    const { counts } = entities || {};
    const { nodes } = entities.gameObjects || {};
    const draggedEntity = nodes[draggedEntityIndex];
    if (!draggedEntity) return;

    // The exact way to calculate the center or relevant point of the entity
    // will depend on your entity structure and hitbox definitions.
    const draggedEntityCenter = {
      x: draggedEntity?.position?.x || 0 + 50,
      y: draggedEntity?.position?.y || 0 + 40,
    };

    // Check collision with other entities
    const targetEntity = nodes.find((targetEntity) => {
      if (
        targetEntity === draggedEntity ||
        !targetEntity.position ||
        targetEntity.isCombining
      )
        return false; // Skip self or entities without size

      const targetBox = {
        left: targetEntity.position.x - 40,
        right: targetEntity.position.x + 40,
        top: targetEntity.position.y - 30,
        bottom: targetEntity.position.y + 30,
      };

      // Simple AABB (Axis-Aligned Bounding Box) collision detection,
      // assuming entities are rectangles and positions are top-left corners.
      // This may need to be adjusted depending on your coordinate system.
      return (
        draggedEntityCenter.x >= targetBox.left &&
        draggedEntityCenter.x <= targetBox.right &&
        draggedEntityCenter.y >= targetBox.top &&
        draggedEntityCenter.y <= targetBox.bottom
      );
      // A drop has occurred, the dragged entity's center is within the bounds of the target entity
    });

    if (targetEntity) {
      targetEntity.isActive = false;

      targetEntity.isCombining = true;
      draggedEntity.isCombining = true;

      combine(draggedEntity.name, targetEntity.name).then((data) => {
        const { name, emoji, props } = data || {};

        if (name && emoji && targetEntity.position && nodes) {
          //ensures the splice doesnt move the other index
          createDefaultGameObject(
            name,
            targetEntity.position,
            undefined,
            props
          ).then((x) => {
            console.log("pushing", name, targetEntity.position, x);
            safePush(nodes, counts, { ...x, ...props });
            dropEntityById(entities, targetEntity.id);
            dropEntityById(entities, draggedEntity.id);
          });
        } else {
          draggedEntity.isActive = true;
          draggedEntity.draggable = { isBeingDragged: false };
          targetEntity.isActive = true;
          draggedEntity.isCombining = false;
          targetEntity.isCombining = false;
        }
      });
    } else {
      draggedEntity.isActive = true;
      draggedEntity.draggable = { isBeingDragged: false };
    }
  };

  return (entities: EntitiesPayload, { input }: SystemArgs<unknown>) => {
    const events =
      input.filter((x: { name: string }) =>
        [
          "onMouseDown",
          "onMouseUp",
          "onMouseMove",
          "onTouchEnd",
          "onTouchStart",
          "onTouchMove",
        ].includes(x.name)
      ) || [];

    const getEntityWithId = (dragEntityId: string) => {
      return entities.gameObjects?.nodes?.find(({ id }) => id === dragEntityId);
    };
    const getEntityIndex = (dragEntityId: string) => {
      return entities.gameObjects?.nodes?.findIndex(
        ({ id }) => id === dragEntityId
      );
    };

    events.forEach(({ name, payload }) => {
      if (name === "onMouseDown" || name === "onTouchStart") {
        const target = payload?.target as HTMLElement;
        dragEntityId = target.getAttribute("data-entity-id") || "";
        const entity = getEntityWithId(dragEntityId);
        if (
          entity &&
          entity.draggable &&
          entity.position &&
          entity.isActive &&
          !entity.isCombining
        ) {
          entity.draggable.isBeingDragged = true;
        }
      } else if (
        dragEntityId &&
        (name === "onMouseMove" || name === "onTouchMove")
      ) {
        const entity = getEntityWithId(dragEntityId);
        if (entity && entity.draggable && entity.position) {
          const { pageX, pageY } = extractPageCoordinates(payload);
          entity.position.x = pageX;
          entity.position.y = pageY;
        }
      } else if (
        dragEntityId &&
        (name === "onMouseUp" || name === "onTouchEnd")
      ) {
        const entityIndex = getEntityIndex(dragEntityId);
        const entity = entities.gameObjects?.nodes[entityIndex];
        resetDragState();
        if (entity && entity.draggable && entity.position) {
          checkForEntityDrop(entities, entityIndex);
        }
      }
    });

    return entities;
  };
})();
