import { combine } from "@/lib/httpClient";
import { EntitiesPayload, GameObject } from "../App";
import { SystemArgs } from "./utils";
import { dropEntityById, safePush } from "@/utils/entities";
import { createDefaultGameObject } from "../gameObjectConstructors";

const handleAutoCombine = () => {
  const TEN_SECONDS = 10000;
  let timeSinceLastCombine = 0;
  return (entities: EntitiesPayload, { time }: SystemArgs<any>) => {
    timeSinceLastCombine += time.delta;
    if (timeSinceLastCombine < TEN_SECONDS) return entities;
    timeSinceLastCombine = 0;
    const { nodes} = entities.gameObjects || [];
    const {counts} = entities || {}
    const combineMap: Map<string, GameObject> = new Map();

    for (let i = 0; i < nodes.length; i++) {
      const draggedEntity = nodes[i];
      if (
        !draggedEntity.isActive ||
        !draggedEntity.autoCombines?.isCombinable ||
        !draggedEntity.position
      )
        continue;
      const { x, y } = draggedEntity.position;
      const hash = `${x - (x % 10)}_${y - (y % 10)}`;
      if (combineMap.has(hash)) {
        const targetEntity = combineMap.get(hash);
        if (
          targetEntity &&
          targetEntity.isActive &&
          targetEntity.autoCombines?.isCombinable
        ) {
          targetEntity.isActive = false;
          draggedEntity.isActive = false;
          targetEntity.isCombining = true;
          draggedEntity.isCombining = true;

          combine(draggedEntity.name, targetEntity.name).then((data) => {
            const { name, emoji, props } = data || {};

            if (name && emoji && nodes && targetEntity.position) {
              //ensures the splice doesnt move the other index
              dropEntityById(entities, targetEntity.id);

              dropEntityById(entities, draggedEntity.id);

              createDefaultGameObject(
                name,
                targetEntity.position,
                undefined,
                props
              ).then((x) => {
                console.log("auto pushing", name, targetEntity.position, x);
                
                safePush(nodes, counts, { ...x, ...props });
              });
            } else {
              targetEntity.isActive = true;
              draggedEntity.isActive = true;
              targetEntity.isCombining = false;
              draggedEntity.isCombining = false;
            }
          });
          break;
        } else {
          draggedEntity.isActive = true;
        }
      } else {
        combineMap.set(hash, draggedEntity);
      }
    }

    return entities;
  };
};

export default handleAutoCombine();
