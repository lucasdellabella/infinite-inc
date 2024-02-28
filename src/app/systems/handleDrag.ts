import { EntitiesPayload } from "../App";
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

  return (entities: EntitiesPayload, { input }: SystemArgs<any>) => {
    const events =
      input.filter((x) =>
        ["onMouseDown", "onMouseUp", "onMouseMove"].includes(x.name)
      ) || [];

    events.forEach(({ name, payload }) => {
      if (name === "onMouseDown") {
        const target = payload?.target as HTMLElement;
        const entityId = target.getAttribute("data-entity-id");
        targetEntityId = entityId || "";
        const entity = entities.gameObjects.nodes.find(
          ({ id }) => id === targetEntityId
        );
        if (entity && entity.draggable && entity.position) {
          entity.draggable.isBeingDragged = true;
          const { clientX, clientY } = extractClientCoordinates(payload);
          dragOffset = {
            x: clientX - target.getBoundingClientRect().left,
            y: clientY - target.getBoundingClientRect().top,
          };
        }
      } else if (targetEntityId && name === "onMouseMove") {
        const entity = entities.gameObjects.nodes.find(
          ({ id }) => id === targetEntityId
        );
        if (entity && entity.draggable && entity.position) {
          const { pageX, pageY } = extractPageCoordinates(payload);
          entity.position.x = pageX - dragOffset.x;
          entity.position.y = pageY - dragOffset.y;
        }
      } else if (targetEntityId && name === "onMouseUp") {
        const entity = entities.gameObjects.nodes.find(
          ({ id }) => id === targetEntityId
        );
        targetEntityId = "";
        dragOffset = { x: 0, y: 0 };
        if (entity && entity.draggable && entity.position) {
          entity.draggable.isBeingDragged = false;
        }
      }
    });

    return entities;
  };
})();
