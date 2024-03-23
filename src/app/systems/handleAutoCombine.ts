import { combine } from "@/lib/httpClient";
import { EntitiesPayload, GameObject } from "../App";
import { SystemArgs } from "./utils";
import { Counts, dropEntityById, safePush } from "@/utils/entities";
import { createDefaultGameObject } from "../gameObjectConstructors";

function autoCombine(
  nodes: GameObject[],
  counts: Counts,
  draggedEntity: GameObject,
  targetEntity: GameObject
) {
  targetEntity.isActive = false;
  draggedEntity.isActive = false;
  targetEntity.isCombining = true;
  draggedEntity.isCombining = true;

  combine(draggedEntity.name, targetEntity.name).then((data) => {
    const { name, emoji, props } = data || {};

    if (name && emoji && nodes && targetEntity.position) {
      //ensures the splice doesnt move the other index
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
}
const handleAutoCombine = () => {
  const MAX_DISTANCE = 20;
  const TEN_SECONDS = 30000;
  let timeSinceLastCombine = 0;
  return (entities: EntitiesPayload, { time }: SystemArgs<any>) => {
    timeSinceLastCombine += time.delta;
    if (timeSinceLastCombine < TEN_SECONDS) return entities;
    timeSinceLastCombine = 0;
    const { nodes } = entities.gameObjects || [];
    const { counts } = entities || {};
    const combineMap: Map<string, GameObject[]> = new Map();

    for (let i = 0; i < nodes.length; i++) {
      const draggedEntity = nodes[i];
      if (
        !draggedEntity.isActive ||
        !draggedEntity.autoCombines?.isCombinable ||
        !draggedEntity.position
      )
        continue;
      const hash = ({ x, y }: { x: number; y: number }): string =>
        `${x - (x % MAX_DISTANCE)}_${y - (y % MAX_DISTANCE)}`;
      const positionString = hash(draggedEntity.position);

      if (combineMap.has(positionString)) {
        combineMap.get(positionString)?.push(draggedEntity);
      } else {
        combineMap.set(positionString, [draggedEntity]);
      }
    }

    const iter = combineMap.entries();
    let result = iter.next();
    while (!result.done) {
      const [, gameObjects] = result.value;
      const activeObjects = gameObjects.filter(
        (x) => x.isActive && x.autoCombines?.isCombinable
      );
      if (activeObjects.length > 1) {
        const [o1, o2] = activeObjects || [];
        autoCombine(nodes, counts, o1, o2);
        activeObjects.forEach((x) => dropEntityById(entities, x.id));
      }
      result = iter.next();
    }
    return entities;
  };
};

export default handleAutoCombine();
