import { EntitiesPayload } from "../engine-only/page";
import { SystemArgs } from "./utils";

export const handleDrag = (() => {
  let dragOffset = { x: 0, y: 0 };
  let targetEntityId = "";

  return (entities: EntitiesPayload, { input, time }: SystemArgs<any>) => {
    const { name, payload } =
      input.find((x) =>
        ["onMouseDown", "onMouseUp", "onMouseMove"].includes(x.name)
      ) || {};

    if (name === "onMouseDown") {
      const entityId = payload?.target.getAttribute("data-entity-id");
      targetEntityId = entityId;
      const entity = entities.gameObjects.nodes.find(
        ({ id }) => id === targetEntityId
      );
      if (entity) {
        entity.isBeingDragged = true;
        dragOffset = {
          x: payload?.clientX - payload?.target.getBoundingClientRect().left,
          y: payload?.clientY - payload?.target.getBoundingClientRect().top,
        };
      }
    } else if (targetEntityId && name === "onMouseMove") {
      const entity = entities.gameObjects.nodes.find(
        ({ id }) => id === targetEntityId
      );
      entity.x = payload?.pageX - dragOffset.x;
      entity.y = payload?.pageY - dragOffset.y;
    } else if (targetEntityId && name === "onMouseUp") {
      const entity = entities.gameObjects.nodes.find(
        ({ id }) => id === targetEntityId
      );
      targetEntityId = "";
      dragOffset = { x: 0, y: 0 };
      entity.isBeingDragged = false;
    }

    return entities;
  };
})();
