import { safePush } from "@/utils/entities";
import { EntitiesPayload, GameObject } from "../App";
import {
  createDefaultGameObject,
  createTractor,
} from "../gameObjectConstructors";
import { SystemArgs } from "./utils";

const getRandomPosition = (baseX = 200, baseY = 200) => ({
  x: baseX + Math.random() * 10,
  y: baseY + Math.random() * 20,
});

export const handleEmits = (
  entities: EntitiesPayload,
  { time }: SystemArgs<any>
) => {
  const { counts } = entities;
  const { nodes } = entities.gameObjects || {};
  entities.gameObjects?.nodes?.forEach((node) => {
    const { emits, isActive } = node;
    if (!emits || !isActive || emits.length === 0) return;

    emits.forEach((emit) => {
      emit.timeLeftMs = (emit.timeLeftMs || emit.frequencyMs) - time.delta;
      if (emit.timeLeftMs <= 0) {
        const { object, frequencyMs } = emit;
        const { position } = node;
        const emitPosition = getRandomPosition(position?.x, position?.y);
        const pushGameObjectIfExists = (newObject: GameObject) => {
          if (newObject) {
            safePush(nodes, counts, newObject);
          }
        };
        if (object === "tractor") {
          createTractor(emitPosition).then(pushGameObjectIfExists);
        } else {
          createDefaultGameObject(object, emitPosition).then(
            pushGameObjectIfExists
          );
        }

        emit.timeLeftMs = frequencyMs;
      }
    });
  });

  return entities;
};
