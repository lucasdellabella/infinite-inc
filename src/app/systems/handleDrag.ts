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

function extractClientCoordinates(event: Input): {
  clientX: number;
  clientY: number;
} {
  let clientX = 0,
    clientY = 0;

  // Check for mouse events
  if ("clientX" in event && "clientY" in event) {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  // Check for touch events
  else if ("touches" in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    throw new Error(`did not match valid event types`);
  }

  return { clientX, clientY };
}

export const handleDrag = (() => {
  let dragOffset = { x: 0, y: 0 };
  let targetEntityId = "";
  const resetDragState = () => {
    dragOffset = { x: 0, y: 0 };
    targetEntityId = "";
  };

  const checkForEntityDrop = (
    entities: EntitiesPayload,
    draggedEntityIndex: number
  ) => {
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
    nodes.forEach((targetEntity, index) => {
      if (targetEntity === draggedEntity || !targetEntity.position) return; // Skip self or entities without size

      const targetBox = {
        left: targetEntity.position.x,
        right: targetEntity.position.x + 80,
        top: targetEntity.position.y,
        bottom: targetEntity.position.y + 60,
      };

      // Simple AABB (Axis-Aligned Bounding Box) collision detection,
      // assuming entities are rectangles and positions are top-left corners.
      // This may need to be adjusted depending on your coordinate system.
      if (
        draggedEntityCenter.x >= targetBox.left &&
        draggedEntityCenter.x <= targetBox.right &&
        draggedEntityCenter.y >= targetBox.top &&
        draggedEntityCenter.y <= targetBox.bottom
      ) {
        // A drop has occurred, the dragged entity's center is within the bounds of the target entity

        combine(draggedEntity.name, targetEntity.name).then((data) => {
          const { name, emoji } = data || {};
          if (name && emoji && targetEntity.position) {
            nodes.splice(index, 1);
            nodes.splice(draggedEntityIndex, 1);
            nodes.push({
              ...createDefaultGameObject(),
              name,
              emoji,
              position: { ...targetEntity.position },
            });
          }
        }) || {};
      }
    });
  };

  return (entities: EntitiesPayload, { input }: SystemArgs<any>) => {
    const events =
      input.filter((x) =>
        ["onMouseDown", "onMouseUp", "onMouseMove"].includes(x.name)
      ) || [];

    const getEntityWithId = (targetEntityId: string) => {
      return entities.gameObjects.nodes.find(({ id }) => id === targetEntityId);
    };
    const getEntityIndex = (targetEntityId: string) => {
      return entities.gameObjects.nodes.findIndex(
        ({ id }) => id === targetEntityId
      );
    };

    events.forEach(({ name, payload }) => {
      if (name === "onMouseDown") {
        const target = payload?.target as HTMLElement;
        targetEntityId = target.getAttribute("data-entity-id") || "";
        const entity = getEntityWithId(targetEntityId);
        if (entity && entity.draggable && entity.position) {
          entity.draggable.isBeingDragged = true;
          const { clientX, clientY } = extractClientCoordinates(payload);
          dragOffset = {
            x: clientX - target.getBoundingClientRect().left,
            y: clientY - target.getBoundingClientRect().top,
          };
        }
      } else if (targetEntityId && name === "onMouseMove") {
        const entity = getEntityWithId(targetEntityId);
        if (entity && entity.draggable && entity.position) {
          const { pageX, pageY } = extractPageCoordinates(payload);
          entity.position.x = pageX - dragOffset.x;
          entity.position.y = pageY - dragOffset.y;
        }
      } else if (targetEntityId && name === "onMouseUp") {
        const entityIndex = getEntityIndex(targetEntityId);
        const entity = entities.gameObjects.nodes[entityIndex];
        resetDragState();
        if (entity && entity.draggable && entity.position) {
          entity.draggable.isBeingDragged = false;
          checkForEntityDrop(entities, entityIndex);
        }
      }
    });

    return entities;
  };
})();
